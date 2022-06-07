import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../types/next";
import { tweetLookup, getLikingUsers, getRetweetingUsers, getQuotedUsers, parseToCsv } from "../../utils/twitter-api";


export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    // get message, socketID
    const id = req.body.id || "";
    const socketID = req.body.socketID || "";

    const lookup = await tweetLookup(id);
    
    res?.socket?.server?.io?.to(socketID).emit("lookup", lookup);

    const likes = await getLikingUsers(id)

    res?.socket?.server?.io?.to(socketID).emit("likes", "success");


    const retweets = await getRetweetingUsers(id)

    res?.socket?.server?.io?.to(socketID).emit("retweets", "success");
    
    const quotes = await getQuotedUsers(id)

    res?.socket?.server?.io?.to(socketID).emit("quotes", "success");
    
    const csvFile = await parseToCsv(likes, retweets, quotes);
    
    res?.socket?.server?.io?.to(socketID).emit("csv", {
      status: "success",
      csvFile: csvFile
    });
    
    // return message
    res.status(201).json(lookup);
  }
};
