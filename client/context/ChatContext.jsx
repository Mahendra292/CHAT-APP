import { createContext, useContext, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { AuthContext } from "./AuthContext";
import axios from 'axios';


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket } = useContext(AuthContext);

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const axiosInstance = axios.create({
        baseURL: backendURL,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    // function to get all users for sidebar
    const getUsers = async () => {
        try {
            console.log("📡 Calling /api/messages/users...");
            const { data } = await axiosInstance.get(`/api/messages/users`);
            console.log("✅ Response from backend:", data);

            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log("❌ getUsers() failed:", error);
            toast.error(error.message || "Failed to fetch users");
        }
    };
 // function to get messages for selectd user
    const getMessages = async (userId) => {
        try {
            const { data } = await axiosInstance.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    //function to send message to selected user

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axiosInstance.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axiosInstance.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
                        ? prevUnseenMessages[newMessage.senderId] + 1
                        : 1,
                }));
            }
        });
    };

    const unSubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unSubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
       
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
