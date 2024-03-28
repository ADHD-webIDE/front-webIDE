import React, { useState, useEffect } from "react";
import sendButton from "../../img/sendButton.png";
import { Client, IMessage } from "@stomp/stompjs";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { createRoom } from "../../api/axios";
import { joinRoomByName } from "../../api/axios";
import { chatHistory } from "../../api/axios";
import { CompatClient } from "@stomp/stompjs";
import { useAppSelector } from "../../store/hook";
import roomIcon from "../../img/roomIcon.png";
import { userRooms } from "../../api/axios";

interface MessageType {
  type: string;
  roomId: string;
  sender: string;
  message: string;
  timestamp: string;
}
interface Rooms {
  id: number;
  name: string;
}

export default function Chat() {
  const [chatValue, setCahtValue] = useState("");
  const [writer, setWriter] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([] as MessageType[]);
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);
  const [roomName, setRoomName] = useState("");
  const [userid, setUserid] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [chatroom, setChatroom] = useState(false);

  const user = useAppSelector((state) => state.persist.user);
  useEffect(() => {
    const socket = new SockJS("http://popos.iptime.org:8080/ws/");
    const client = Stomp.over(socket);

    // const name = prompt("send your name");
    // console.log(name);
    const username = user.map((data: any) => data.username).join(" ");
    setUserid(username);
    setNickname(username);
    client.connect({}, () => {
      console.log("Connected to WebSocket");
      client.subscribe(`/topic/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    });
    setStompClient(client);

    // 소켓이 연결되었을 때 실행되는 코드
    socket.onopen = () => {
      console.log("WebSocket connected");
    };
    // 소켓이 닫혔을 때 실행되는 코드
    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      // 컴포넌트가 언마운트될 때 실행되는 코드
      socket.close(); // 소켓 연결 닫기
      if (client) {
        client.disconnect(); // Stomp 클라이언트 연결 종료
      }
    };
  }, [roomId]); // roomId가 변경될 때마다 실행되도록 함
  const sendMessage = (e: any) => {
    e.preventDefault();

    if (stompClient) {
      const chatMessage = {
        type: "TALK",
        roomId: roomId,
        sender: userid,
        message: message,
      };

      stompClient.send(
        `/app/chat.sendMessage/${roomId}`,
        {},
        JSON.stringify(chatMessage)
      );
    } else {
      console.error("Stomp client is not initialized.");
    }
    setMessage("");
  };
  const onClick = async () => {
    const result = await createRoom(roomName);
    console.log(result);
    setShowCreateRoom(false);
    const resultJoin = await joinRoomByName(roomName, userid);
    console.log(resultJoin.roomId);
    setRoomId(resultJoin.roomId);
    const username = user.map((data: any) => data.username).join("");
    setUserid(username);
    const resultRooms = await userRooms(userid);
    console.log(resultRooms);
    setRooms(resultRooms);
  };
  // const joinRoom = async () => {
  // const username = user.map((data: any) => data.username);
  // 채팅방 데이터 가져오기
  // const showRoooms = async () => {
  //   const username = user.map((data: any) => data.username).join("");
  //   setUserid(username);
  //   const resultRooms = await userRooms(userid);
  //   console.log(resultRooms);
  //   setRooms(resultRooms);
  // };
  // };
  const joinRoom = async (roomName: any, userid: any) => {
    const resultJoin = await joinRoomByName(roomName, userid);
    console.log(resultJoin.roomId);
    setRoomId(resultJoin.roomId);
    setChatroom(!chatroom);
  };
  console.log(chatroom);
  return (
    <div>
      <div className=" absolute top-11 right-2 w-[30%] h-4/5 rounded-2xl bg-gradient-to-r to-cyan-500 from-blue-500 z-50 ">
        <div>
          <img
            src={roomIcon}
            alt=""
            className="absolute right-2 top-2 cursor-pointer"
            onClick={() => setShowCreateRoom(!showCreateRoom)}
          />
          <button onClick={() => setChatroom(!chatroom)}></button>
        </div>
        {showCreateRoom && (
          <div className="flex justify-center">
            <div className="absolute h-1/5 top-5 rounded-2xl bg-black">
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  placeholder=" 방이름"
                  className="mt-10 w-11/12 rounded text-black"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <button className="mt-10" onClick={onClick}>
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {!chatroom &&
          rooms.map((room: Rooms, index: number) => (
            <div
              key={index}
              className="rounded-2xl ring-2 ring-white w-1/3 h-1/6 flex justify-center items-center cursor-pointer"
              onClick={() => joinRoom(room.name, userid)}
            >
              {room.name}
            </div>
          ))}
        {chatroom && (
          <div>
            <div className="chatBox">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.sender === userid ? "text-right" : "text-left"
                  }`}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.message}
                </div>
              ))}
            </div>
            <div className="flex absolute bottom-0 w-full h-[10%]  rounded-b-2xl bg-white ">
              <textarea
                rows={2}
                value={message}
                className="resize-none text-black w-full mr-20 rounded-b-2xl focus:outline-none focus:border-2 inline-block  p-2"
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <div className="relative">
                <button
                  type="submit"
                  className="absolute items-center bottom-3 right-3 w-14"
                  onClick={sendMessage}
                >
                  <img src={sendButton} alt="sendButton" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
