import axios from "axios";
import { setUser } from "../store/reducers/userSlice";
import { useAppDispatch, useAppSelector } from "../store/hook";

// https://2716-112-218-243-204.ngrok-free.app
//로그인
export const login = async (username, password, dispatch) => {
  // dispatch 파라미터 추가
  try {
    const result = await axios.post("https://2716-112-218-243-204.ngrok-free.app/members/login", {
      username,
      password,
    });

    return result.data;
  } catch {
    return "failed to login";
  }
};

// 회원가입
export const menbershipApi = async (name, email, username, password, birth) => {
  const result = await axios.post("https://2716-112-218-243-204.ngrok-free.app/members/register", {
    name: name,
    email: email,
    username: username,
    password: password,
    birth: birth,
  });
  return result.data;
};

// 등록된 사용자 아이디 데이터를 가져오기
export const getUserId = async (userEmail, idName, idBirthDate) => {
  try {
    const response = await axios.get(
      "https://2716-112-218-243-204.ngrok-free.app/members/findUsername",
      {
        params: {
          email: userEmail,
          name: idName,
          birth: idBirthDate,
        },
      }
    );
    return response.data;
  } catch {
    return "error";
  }
};

// 등록된 사용자 비밀번호 데이터를 가져오기
export const getUserPW = async (userid, pwName, pwBirthDate) => {
  const response = await axios.post(
    "https://2716-112-218-243-204.ngrok-free.app/members/validateUser",
    {
      username: userid,
      name: pwName,
      birth: pwBirthDate,
    }
  );
  return response.data;
};

// 등록된 사용자 비밀번호 데이터 변경
export const changeUserPassword = async (userid, changePw) => {
  const response = await axios.post(
    "https://2716-112-218-243-204.ngrok-free.app/members/reset-password",
    {
      username: userid,
      newPassword: changePw,
    }
  );
  return response.data;
};

// 챗팅 방만들기
export const createRoom = async (roomName, userid) => {
  try {
    const response = await axios.post(
      "http://popos.iptime.org:8080/chat/createRoom",
      { name: roomName }
    );
    console.log(roomName);
    return response.data;
  } catch {
    console.log(userid);
    console.log(roomName);
    return "failed to login";
  }
};

//챗팅방
// params
export const userRooms = async (userid) => {
  try {
    const response = await axios.get(
      `http://popos.iptime.org:8080/chat/roomsByUser/${userid}`
    );
    console.log(response.data);
    return response.data;
  } catch {
    console.log("Error fetching rooms");
    return "error";
  }
};

// 챗팅방 들어가기
export const joinRoomByName = async (roomName, userId) => {
  try {
    const response = await axios.post(
      "http://popos.iptime.org:8080/chat/joinRoomByName",
      { roomName: roomName, userId: userId } // 키 이름을 백엔드와 일치시킵니다.
    );
    console.log(roomName);
    console.log(userId);
    return response.data;
  } catch (error) {
    console.error("Error joining room:", error);
    return "failed to join room";
  }
};

// 채팅방 데이터 불러오기
export const chatHistory = async (roomId) => {
  try {
    const response = await axios.get(
      `http://popos.iptime.org:8080/chat/chatHistory/${roomId}`
    );
    console.log(roomId);

    return response.data;
  } catch {
    console.log("Error fetching rooms");
    return "error";
  }
};
