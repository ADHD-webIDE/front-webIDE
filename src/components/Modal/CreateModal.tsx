import { useState } from "react";
import cancelIcon from "../../img/containerPage/icon_cancel.png";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { createContainer } from "../../store/containerSlice/containerSlice";
import { v4 } from "uuid";
import { OpenCreateModal } from "../../store/modalSlice/modalSlice";
import { createContainerTest } from "../../api/container";

export default function CreateModal() {
  const [stack, setStack] = useState("javascript");
  const [containerTitle, setContainerTitle] = useState("");
  const [performance, setPerformance] = useState("@ 0.5vCPU @ 1GB");
  const [titleCheck, setTitleCheck] = useState(false);
  const user = useAppSelector((state) => state.persist.user);
  const [username] = user.map((data: any) => data.username);
  
  const dispatch = useAppDispatch();

  const closeCreateModal = () => {
    dispatch(OpenCreateModal(false));
  };

  const createContainers = async () => {
    const test = await createContainerTest("fff","asd",stack,"1024","3072");
    console.log(test);
    if (!titleCheck) {
      const newData = {
        id: v4(),
        title: containerTitle,
        stack,
        performance,
      };
      dispatch(createContainer(newData));
      closeCreateModal();
    }
  };
  return (
    <div className="absolute inset-0 z-20 w-full bg-black/60 flex justify-center items-center">
      <div className="border-2 bg-white w-[500px] h-[600px]">
        <div className="flex justify-between p-5">
          <div>컨테이너 생성하기</div>
          <button onClick={closeCreateModal}>
            <img src={cancelIcon} alt="cancel" className="w-4" />
          </button>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="w-[400px]">
            <div className="flex flex-col">
              <label htmlFor="stack">스택</label>
              <select
                id="stack"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                className="border-2 rounded p-3 mb-4 focus:outline-none focus:border-2 focus:border-sky-500"
              >
                <option value="javascript">JAVASCRIPT</option>
                <option value="typescript">TYPESCRIPT</option>
                <option value="java">JAVA</option>
                <option value="python">PYTHON</option>
                <option value="csharp">C#</option>
                <option value="php">PHP</option>
              </select>
            </div>
            <div className="flex flex-col mt-5">
              <span>컨테이너 이름</span>
              <input
                type="text"
                className={`border-2 rounded mb-3 p-3 focus:outline-none focus:border-2 ${
                  titleCheck ? "focus:border-red-500" : "focus:border-sky-500"
                }`}
                onChange={(e) => {
                  if (containerTitle.length < 20) {
                    setTitleCheck(false);
                  } else {
                    setTitleCheck(true);
                  }
                  setContainerTitle(e.target.value);
                }}
                placeholder="20자 미만으로 입력해주세요"
              />
              {titleCheck && (
                <span className="mb-2 text-red-500 text-sm">
                  20자 미만으로 입력해주세요.
                </span>
              )}
            </div>
            <div className="flex flex-col mt-5">
              <label htmlFor="performance">성능</label>
              <select
                id="performance"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                className="border-2 rounded mb-4 p-3 focus:outline-none focus:border-2 focus:border-sky-500"
              >
                <option value="@ 0.5vCPU @ 1GB">
                  Micro @ 0.5vCPU @ 1GB Memory
                </option>
                <option value="@ 0.5vCPU @ 2GB">
                  Micro @ 0.5vCPU @ 2GB Memory
                </option>
                <option value="@ 0.5vCPU @ 3GB">
                  Micro @ 0.5vCPU @ 3GB Memory
                </option>
                <option value="@ 0.5vCPU @ 4GB">
                  Micro @ 0.5vCPU @ 4GB Memory
                </option>
              </select>
            </div>
            <button
              className="border rounded-md w-full mt-[100px] p-4 bg-blue-950 text-white"
              onClick={createContainers}
            >
              생성하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
