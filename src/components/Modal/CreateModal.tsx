import { Dispatch, SetStateAction, useState } from "react";
import cancelIcon from "../../img/containerPage/icon_cancel.png";

interface CreateModalProps {
    setIsCreateModal: React.Dispatch<React.SetStateAction<boolean>>
    setContainerLists: Dispatch<SetStateAction<{ id: string; title: string; stack: string; performance: string; }[]>>
    containerLists: any;
}
export default function CreateModal({setIsCreateModal, setContainerLists, containerLists}: CreateModalProps) {
    const [stack, setStack] = useState("HTML/CSS/JS");
    const [containerTitle, setContainerTitle] = useState("");
    const [performance, setPerformance] = useState("@ 0.5vCPU @ 1GB");

    const closeCreateModal = () => {
        setIsCreateModal(false);
    }

    const createContainer = () => {
        let newData = containerLists;
        newData = {
            id: new Date(),
            title: containerTitle,
            stack,
            performance
        }
        setContainerLists((prev) => [...prev, newData])
        setIsCreateModal(false);
    }
  return (
    <div className="absolute inset-0 z-20 w-full bg-black/60 flex justify-center items-center">
        <div className="border-2 bg-white w-[500px] h-[600px]">
            <div className="flex justify-between p-5">
                <div>컨테이너 생성하기</div>
                <button onClick={closeCreateModal}>
                    <img src={cancelIcon} alt="cancel" className="w-4"/>
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
                    className="border-2 rounded p-3 mb-4 focus:outline-none focus:border=2 focus:border-sky-500"
                    >
                        <option value="HTML/CSS/JS">HTML/CSS/JS</option>
                        <option value="REACT">REACT</option>
                        <option value="JAVA">JAVA</option>
                        <option value="C++">C++</option>
                    </select>
                </div>
                <div className="flex flex-col mt-5">
                    <span>컨테이너 이름</span>
                    <input 
                    type="text" 
                    className="border-2 rounded p-3 mb-4 focus:outline-none focus:border=2 focus:border-sky-500"
                    onChange={(e) => setContainerTitle(e.target.value)}
                    />
                </div>
                <div className="flex flex-col mt-5">
                    <label htmlFor="performance">성능</label>
                    <select
                    id="performance"
                    value={performance}
                    onChange={(e) => setPerformance(e.target.value)}
                    className="border-2 rounded mb-4 p-3 focus:outline-none focus:border=2 focus:border-sky-500"
                    >
                    <option value="@ 0.5vCPU @ 1GB">Micro @ 0.5vCPU @ 1GB Memory</option>
                    <option value="@ 0.5vCPU @ 2GB">Micro @ 0.5vCPU @ 2GB Memory</option>
                    <option value="@ 0.5vCPU @ 3GB">Micro @ 0.5vCPU @ 3GB Memory</option>
                    <option value="@ 0.5vCPU @ 4GB">Micro @ 0.5vCPU @ 4GB Memory</option>
                    </select>
                </div>
                <button 
                className="border rounded-md w-full mt-[100px] p-4 bg-blue-950 text-white"
                onClick={createContainer}
                >
                    생성하기
                </button>
                </div>
            </div>
        </div>
    </div>
  )
}