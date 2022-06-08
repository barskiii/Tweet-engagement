import { responseSymbol } from "next/dist/server/web/spec-compliant/fetch-event"
import { useState, useEffect, useRef } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { MdDoneAll } from "react-icons/md"
import socketio from "socket.io-client"
import { useSpring, animated } from 'react-spring'

interface Message {
    status: "loading" | "success" | "notLoading"
}

interface IFormInput {
    id: string
}

function Form() {
    const [likes, setLikes] = useState<Message>({ status: 'notLoading' })
    const [retweets, setRetweets] = useState<Message>({ status: 'notLoading' })
    const [quotes, setQuotes] = useState<Message>({ status: 'notLoading' })

    const submitRef = useRef<HTMLButtonElement>(null)
    
    const [lookupLoading, setLookupLoading] = useState<boolean>(false)
    const [socketID, setSocketID] = useState<string>("")
    const [lookupError, setLookupError] = useState<string>("")

    const [recivingDiv, setRecivingDiv] = useState<boolean>(false)
    const [csvDiv, setCsvDiv] = useState<boolean>(false)

    const [csv, setCsv] = useState<string>("")



    // Submiting data
    const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();
    const onSubmit: SubmitHandler<IFormInput> = async data => {
        setLookupLoading(true)
        setRecivingDiv(false)
        setCsvDiv(false)
        setCsv("")

        setLikes({ status: 'notLoading' })
        setRetweets({ status: 'notLoading' })
        setQuotes({ status: 'notLoading' })
        
        const res = await fetch("/api/tweet-lookup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: data.id,
                socketID: socketID
            })
        })
    };

    // Socket handling
    useEffect((): any => {
        // connect to socket server
        const socket = socketio(process.env.NEXT_PUBLIC_HOST || "http://localhost:3000", {
            path: '/api/socketio'
        })

        socket.on("connect", () => {
            console.log("SOCKET CONNECTED!", socket.id);
            setSocketID(socket.id)
        });

        socket.on("lookup", lookup => {
            console.log("LOOKUP", lookup);
            if (lookup === "good") {
                setRecivingDiv(true)
                setLikes({ status: 'loading' })
            } else if (lookup === "bad") {
                setLookupError("Tweet not found.")
                setLookupLoading(false)
            } else {
                setLookupError("Tweet too old.")
                setLookupLoading(false)
            }
        })

        socket.on("likes", likes => {
            if (likes === "success") {
                setLikes({ status: 'success' })
                setRetweets({ status: 'loading' })
            }
        })
        
        socket.on("retweets", retweets => {
            if (retweets === "success") {
                setRetweets({ status: 'success' })
                setQuotes({ status: 'loading' })
            }
        })
        
        socket.on("quotes", quotes => {
            if (quotes === "success") {
                setQuotes({ status: 'success' })
                setCsvDiv(true)
            }
        })

        socket.on('csv', csv => {
            if (csv.status === "success") {
                setCsv(csv.csvFile)
                setLookupLoading(false)
            }
        })
        
    }, []);

    // Disable button while loading
    useEffect(() => {
        if (lookupLoading && submitRef.current) {
            submitRef.current.disabled = true
        }
        if (!lookupLoading && submitRef.current) {
            submitRef.current.disabled = false
        }

    }, [lookupLoading])


    // Spring loading animation
    const [rcSpringStyles, rcSpringApi] = useSpring(() => ({
        from: {
            opacity: 0,
            translateY: 150,
        },
    }))

    useEffect(() => {
        if (recivingDiv) {
            rcSpringApi.start({
                to: {
                    opacity: 1,
                    translateY: 0,
                }
            })
        }
    }, [recivingDiv])

    // Csv div animation
    const [csvSpringStyles, csvSpringApi] = useSpring(() => ({
        from: {
            opacity: 0,
            translateY: 150,
        },
    }))

    useEffect(() => {
        if (csvDiv) {
            csvSpringApi.start({
                to: {
                    opacity: 1,
                    translateY: 0,
                }
            })
        }
    }, [csvDiv])

    return (
        <div className="w-screen flex justify-center lg:justify-start">
            <div className="relative flex flex-col justify-center transition-all pt-[8vh] lg:pt-[15vh] lg:justify-start lg:ml-[20vw] space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-600/60 text-white px-6 py-6 rounded-lg space-y-8 border border-[#2446C7] 
                                                                    shadow-2xl shadow-cyan-200/50 lg:px-8 lg:py-8">
                    <h1 className="text-4xl">Enter a Tweet ID</h1>
                    <div className="space-y-2">
                        <input type="text"
                            onFocus={() => setLookupError("")}
                            {...register("id", { required: true })}
                            className="w-full h-10 bg-gray-600/0 outline-none px-3 rounded-sm border-b border-white focus:border-b focus:border-cyan-500 
                                                    transition ease-linear duration-700" placeholder="Ex: 1532805330190716929"
                        />
                        {errors.id && <p className="text-sm text-orange-400">This field is required</p>}
                        {lookupError != '' && <p className="text-sm text-orange-400">{lookupError}</p>}
                    </div>
                    <button className="w-full h-10 bg-gray-600/0 outline-none px-3 rounded-sm border border-cyan-300 
                                    hover:border-cyan-600 transition ease-linear duration-300 text-cyan-400" type="submit" ref={submitRef} >
                        {!lookupLoading && <p>Submit</p>}
                        {lookupLoading && 
                            <div className="flex justify-center items-center space-x-2">
                            <div className="spinner-border animate-spin inline-block w-5 h-5 border-2 rounded-full text-cyan-400" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            </div>
                        }
                        
                    </button>
                </form>

                <animated.div style={{...rcSpringStyles}} className={`bg-gray-600/60 text-white px-6 py-6 rounded-lg space-y-3 border border-[#2446C7] shadow-2xl shadow-cyan-200/50 ${!recivingDiv && 'hidden'}`}>
                    <div className={`flex items-center space-x-3 ${likes.status === "notLoading" && "text-gray-500"}`}>
                        <p>Retrieving likes</p>
                        {
                            likes.status === "loading" &&
                            <div className="spinner-grow inline-block w-2 h-2 bg-current rounded-full opacity-0" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        }
                        {
                            likes.status === "success" &&
                            <MdDoneAll />
                        }
                    </div>
                    <div className={`flex items-center space-x-3 ${retweets.status === "notLoading" && "text-gray-500"}`}>
                        <p>Retrieving retweets</p>
                        {
                            retweets.status === "loading" &&
                            <div className="spinner-grow inline-block w-2 h-2 bg-current rounded-full opacity-0" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        }
                        {
                            retweets.status === "success" &&
                            <MdDoneAll />
                        }
                    </div>
                    <div className={`flex items-center space-x-3 ${quotes.status === "notLoading" && "text-gray-500"}`}>
                        <p>Retrieving quotes</p>
                        {
                            quotes.status === "loading" &&
                            <div className="spinner-grow inline-block w-2 h-2 bg-current rounded-full opacity-0" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        }
                        {
                            quotes.status === "success" &&
                            <MdDoneAll />
                        }
                    </div>
                </animated.div>

                <animated.div style={{...csvSpringStyles}} className={`bg-gray-600/60 text-white px-6 py-6 text-xl flex justify-center rounded-lg space-y-3 border border-[#2446C7] shadow-2xl shadow-cyan-200/50 ${!csvDiv && 'hidden'}`}>
                    { csv != "" ?
                        <h2>Your <a href={csv} className="text-cyan-200">CSV</a> file is ready !</h2>
                        :
                        <div className={`flex items-center space-x-3`}>
                            <div className="spinner-grow inline-block w-4 h-4 bg-current rounded-full opacity-0" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h2>CSV file is getting generated</h2>
                        </div>
                    }

                </animated.div>

            </div>
        </div>
    )
}

export default Form