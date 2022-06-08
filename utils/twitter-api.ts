import { Twitter } from "../types/twitterApi";
import moment from 'moment'
import axios from 'axios'
import { Parser } from 'json2csv'
import fs from 'fs'
import {storage} from '../firebase'
import {ref, uploadString, getDownloadURL} from 'firebase/storage'

// Twitter API bearer token
const bearerToken = process.env.TWITTER_BEARER_TOKEN;

interface Params {
    max_results: number,
    pagination_token?: string
    expansions?: string
}


// Tweet Lookup
export const tweetLookup = async (tweetId: string) => {
    try {
        const url = `https://api.twitter.com/2/tweets?ids=${tweetId}&tweet.fields=created_at`
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        })

        if (response.data.errors) {
            return "bad"
        }

        // Checks if tweet is older than 7 days
        const now = moment();
        const created_at = moment(response.data.data[0].created_at);

        const difference = now.diff(created_at, 'days');

        if (difference > 7) {
            return "old"
        }
        return "good"
    } catch {
        return "bad"
    }
}

// Twitter API v2
// Get tweet liking users paginated
export const getLikingUsers = async (tweetId: string, next: string = '', result: Twitter[] | [] = []): Promise<Twitter[] | []> => {
    const url = `https://api.twitter.com/2/tweets/${tweetId}/liking_users`

    let params: Params = {
        max_results: 100,
    }
    next ? params.pagination_token = next : null;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        },
        params: params
    });

    if (response.data.data) {
        result = result.concat(response.data.data);

        if (response.data.meta.next_token) {
            return await getLikingUsers(tweetId, next = response.data.meta.next_token, result = result);
        }
    }
    return result
}

// Get tweet retweeting users paginated
export const getRetweetingUsers = async (tweetId: string, next: string = '', result: Twitter[] | [] = []): Promise<Twitter[] | []> => {
    const url = `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`

    let params: Params = {
        max_results: 100,
    }
    next ? params.pagination_token = next : null;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        },
        params: params
    });

    if (response.data.data) {
        result = result.concat(response.data.data);

        if (response.data.meta.next_token) {
            return await getRetweetingUsers(tweetId, next = response.data.meta.next_token, result = result);
        }
    }
    return result
}

// Get users that quoted a tweet
export const getQuotedUsers = async (tweetId: string, next: string = '', result: Twitter[] | [] = []): Promise<Twitter[] | []> => {
    const url = `https://api.twitter.com/2/tweets/${tweetId}/quote_tweets`
    let params: Params = {
        expansions: 'author_id',
        max_results: 100
    }
    next ? params.pagination_token = next : null;
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        },
        params: params
    });
    if (response.data.includes) {
        result = result.concat(response.data.includes.users);
        if (response.data.meta.next_token) {
            return await getQuotedUsers(tweetId, next = response.data.meta.next_token, result = result);
        }
    }
    return result
}

export const parseToCsv = async (likes: Twitter[], retweets: Twitter[], quotes: Twitter[]) => {
    let cnt = 0
    const data = []

    const LIKES = likes.map(like => like.username)
    const RETWEETS = retweets.map(retweet => retweet.username)
    const QUOTES = quotes.map(quote => quote.username)

    console.log("LIKES LIKES LIKES LIKES",LIKES)
    console.log("RETWEETS RETWEETS RETWEETS RETWEETS",RETWEETS)
    console.log("QUOTES QUOTES QUOTES QUOTES",QUOTES)

    while (LIKES.length >= cnt || RETWEETS.length >= cnt || QUOTES.length >= cnt) {
        data.push({ liked_by_user: LIKES[cnt] || '', retweeted_by_user: RETWEETS[cnt] || '', quoted_by_user: QUOTES[cnt] || '' })
        cnt++
    }

    const csv = new Parser({ fields: ["liked_by_user", "retweeted_by_user", "quoted_by_user"] }).parse(data)

    const fname = `tweet_${(new Date().toJSON().slice(0, 10))}.csv`;

    const storageRef = ref(storage, fname)

    const snapshot = await uploadString(storageRef, csv)
    const downloadUrl = await getDownloadURL(ref(storage, snapshot.metadata.fullPath))

    return downloadUrl
}