import Monaco from "@monaco-editor/react";
import { useAppSelector } from "../store/hook";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import "../custom-scrollbar.css";
import { TreeView } from "@mui/x-tree-view";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import SockJS from "sockjs-client";
import Stomp from 'stompjs';
import { FaRegFolder, FaRegFolderOpen } from "react-icons/fa";
import { RiFolderAddLine, RiDeleteBinLine } from "react-icons/ri";
import { FaRegFile } from "react-icons/fa";
import { AiOutlineFileAdd } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { TreeItemData } from "../models/treeItemType";
import {
  addNewFile,
  addNewFolder,
  deleteItem,
  updateCode,
  fetchCode,
  selectItemId,
  selectItemCode,
  getEditorCode,
  clickedDirectory,
} from "../store/editorSlice/editorSlice";
import chatIcon from "../img/chatIcon.png";
import Chat from "../components/Modal/Chat";
import { commandTest, createCommand, getConsole, getContainerData, treeCommand } from "../api/editor";

export default function Editor() {
  const [showChat, setShowChat] = useState(false);
  const [isConsole, setIsConsole] = useState(true);
  const [isTerminal, setIsTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState<any>('');
  const [terminalOutput, setTerminalOutput] = useState<any>([]);
  const [stompClient, setStompClient] = useState(null);
  const [taskArn, setTaskArn] = useState("");
  const [logData, setLogData] = useState<any>();
  const user = useAppSelector((state) => state.persist.user);
  const [username] = user.map((data: any) => data.username);
  const { title, stack, performance } = useAppSelector(
    (state) => state.container.clickedContainer
  );
  const [currentDirectory, setCurrentDirectory] = useState([""]);
  const {
    treeItems,
    selectedItem,
    selectedItemCode,
    directory,
    outPut,
    isLoading,
    isError,
  } = useAppSelector((state) => state.editor);

  const editorRef = useRef<any>();
  const dispatch = useDispatch();

  const handleInputChange = (event:ChangeEvent<HTMLInputElement>) => {
    setTerminalInput(event.target.value);
  };

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    switch (terminalInput){
      case 'clear':
        setTerminalOutput([]);
        break;
      case 'ls':
        //sendCommand();
        setTerminalOutput([...terminalOutput, { type: 'command', value: logData }]);
        break;
      default:
        if (terminalInput.startsWith('cd ')) {
          if(findDirectory(terminalInput) && !terminalInput.includes('.')){
            setCurrentDirectory([...currentDirectory, terminalInput.substring(3)]);
          }else if(terminalInput.substring(3) === '../') {
            currentDirectory.pop();
            currentDirectory.join("") === title && dispatch(selectItemId(""));
            setCurrentDirectory(currentDirectory);
          }else {
            setTerminalOutput([...terminalOutput, {type: 'input', value: 'Invalid terminal input'}]);
          }
        }
        else if(terminalInput.startsWith('mkdir ')) {
          const input = terminalInput.substring(6);
          dispatch(addNewFolder({input, title}));
        }
        else if (terminalInput) {
          setTerminalOutput([...terminalOutput, { type: 'input', value: terminalInput }]);
        }
        break;
    }

    // 결과
    setTerminalInput('');
  };

  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };
  
  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    await consoleTest();
    //dispatch(fetchCode({ stack, sourceCode }));
  };

  // 선택한 아이템의 아이디와 코드.
  const handleItemSelect = (id: string, code: string | undefined, directory: any[]) => {
    dispatch(selectItemId(id));
    dispatch(selectItemCode(code));
    dispatch(clickedDirectory(directory));
  };

  const savedCode = () => {
    dispatch(updateCode(selectedItem));
    sendCreateCommand();
  };

  //버튼 액션.
  const handleAction = (action: "folder" | "file" | "delete") => {
    if (action === "delete") {
      dispatch(deleteItem(selectedItem));
      return;
    }
    const input = prompt(
      action === "folder" ? "폴더명을 입력해주세요." : "파일명을 입력해주세요."
    );
    if (input) {
      switch (action) {
        case "folder":
          const fullInput = `mkdir ${directory?.join('/')}/${input}`;
          console.log(fullInput);
          addFolderCommand(username, fullInput, taskArn, "zxcTes");
          dispatch(addNewFolder({input, title}));
          break;
        case "file":
          dispatch(addNewFile(input));
          break;
        default:
          break;
      }
    }
  };

  const handleConsole = (isCheck: boolean) => {
    if(isCheck === isTerminal){
      setIsConsole(false);
      setIsTerminal(true);
    } else {
      setIsConsole(true);
      setIsTerminal(false);
    }
  }

  // 파일 생성 체크.
  const findText = ():boolean => {

    const childrenFindText = (childrenItem: TreeItemData[]):boolean => {
      return childrenItem.some((child) => {
        if(child.type === "text"){
          return true;
        }else if(child.children){ 
          return childrenFindText(child.children);
        }
      })
    }

   return treeItems.some((item) => {
      if(item.type === "text"){
        return true;
      } else if(item.children){
        return childrenFindText(item.children);
      }
    })
  }

  const findDirectory = (terminalInput: string):boolean => {
    const childrenFindDirectory = (childrenItem: TreeItemData[], currentDirectory: string[]):boolean => {
      const newDirectory = currentDirectory.concat(terminalInput.substring(3));
      return childrenItem.some((child) => {
        if(child.treeDirectory?.join("/") === newDirectory.join("/")){
          dispatch(selectItemId(child.id));
          return true;
        }else if(child.children){
          return childrenFindDirectory(child.children, currentDirectory);
        }
      })
    }
   return treeItems.some((item) => {
      if(item.label === terminalInput.substring(3) && currentDirectory.length < 2){
        dispatch(selectItemId(item.id));
        return true;
      } else if(item.children){
        return childrenFindDirectory(item.children, currentDirectory);
      }
    })
  }

  const getTaskArn = async () => {
    try{
      const [taskArn] = await getContainerData();
      setTaskArn(taskArn);
    }catch(err){
      return console.error(err);
    }
  }

  const consoleTest = async () => {
    try{
      const test = await getConsole(directory?.join('/'), taskArn, "zxcTes");
      console.log(test);
    }catch(err){
      return console.error(err);
    }
  }
  
  const socket = () => {
    getTaskArn();
    const socket = new SockJS('https://2716-112-218-243-204.ngrok-free.app/websocket');
    const client = Stomp.over(socket);
      client.connect({}, () => {
        console.log('Connected to WebSocket');
        client.subscribe('/topic/commandOutput', (message) => {
          const newData = JSON.parse(message.body);
          const content = newData.content;
          console.log(content);
          setTerminalOutput([...terminalOutput,{type: 'command', value: content}]);
        })
      });
  }
console.log(terminalOutput);
  const sendCommand = async () => {
    try{
      await commandTest(username,"ls",taskArn,"zxcTes");
    }catch(err){
      return console.error(err);
    }
  }

  const sendCreateCommand = async () => {
    try{
      const test = selectedItemCode?.replace(/(\r\n|\n|\r)/gm, "");
      await createCommand(username, test?.replace(/"/g, '\\"'), taskArn, "zxcTes", directory?.join('/'));
    }catch(err) {
      return console.error(err);
    }
  }

  const addFolderCommand = async (username: string, command: string, taskArn: string, projectName: string) => {
    try{
      await treeCommand(username,command,taskArn,projectName);
    }catch(err){
      return console.error(err);
    }
  }


  // 폴더 및 파일 외 다른 부분 클릭시 디렉토리 초기화
  useEffect(() => {
    socket();
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".MuiTreeView-root")&&!target.closest("button")) {
        dispatch(selectItemId(null));
        dispatch(clickedDirectory([""]));
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // 코드 편집기 부분 제외.
  const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="text-white w-screen h-screen ">
      {/* 챗팅 */}
      <div>
        {showChat && <Chat />}
        <button
          className="absolute bottom-2 right-2"
          onClick={() => setShowChat(!showChat)}
        >
          <img
            src={chatIcon}
            alt="챗팅"
            className="w-12 h-12  shadow  rounded-full hover:shadow-sky-400/70  "
          />
        </button>
      </div>
      {/* 헤더 */}
      <header className="h-[5%] p-3 bg-black flex justify-between items-center">
        <div>{performance}</div>

        <div>
          <button
            className="m-1 border border-green-500 text-green-500 rounded w-[50px]"
            onClick={savedCode}
          >
            Save
          </button>
          <button
            onClick={runCode}
            className={`m-1 border border-green-500 text-green-500 rounded w-[50px] ${
              isLoading && "disabled border-green-500/60 text-green-500/60"
            }`}
          >
            Run
          </button>
        </div>

        <div>
          <img
            src="https://i.pinimg.com/originals/fb/8e/8a/fb8e8a96fca2f049334f312086a6e2f6.png"
            alt="logo"
            className="rounded-full border-2 border-green-500 w-7 mr-1 cursor-pointer"
          />
        </div>
      </header>

      <div className="flex h-[95%] bg-slate-800">
        {/* 트리 */}
        <nav className="w-[15%] h-full border-2 border-black">
          <div className="bg-blue-500 h-[4%] flex justify-between items-center">
            <div className="ml-2">{title}</div>
            <div className="mr-2 mt-1">
              <button
                className="mr-1 text-[20px]"
                onClick={() => handleAction("folder")}
              >
                <RiFolderAddLine />
              </button>
              <button
                className="mr-1 text-[20px]"
                onClick={() => handleAction("file")}
              >
                <AiOutlineFileAdd />
              </button>
              <button
                className="mr-1 text-[20px]"
                onClick={() => handleAction("delete")}
              >
                <RiDeleteBinLine />
              </button>
            </div>
          </div>
          <div className="h-[96%]">
            <div>
              <TreeView
                aria-label="file system navigator"
                defaultEndIcon={<FaRegFolder />}
              >
                {renderTreeItems(treeItems, handleItemSelect)}
              </TreeView>
            </div>
          </div>
        </nav>

        {/* 편집기 */}
        <div className="w-[85%]" onClick={handleEditorClick}>
          <div className="h-[70%] flex justify-center items-center">
            { findText() ?
            <Monaco
              theme="vs-dark"
              language={stack}
              value={selectedItemCode}
              onChange={(selectedItemCode) =>
                dispatch(getEditorCode(selectedItemCode))
              }
              onMount={onMount}
            />
            : <p className="text-green-500">파일을 생성하세요!</p>
            }
          </div>

          {/* 콘솔 */}
          <div className="h-[30%] overflow-y-auto">
            <header className="w-full bg-black flex items-center fixed">
              <button className={`bg-black w-[100px] p-[5px] border-t-2 ${isConsole && "border-blue-500"} `} onClick={() => handleConsole(isConsole)}>
                Console
              </button>
              <button className={`bg-black w-[100px] p-[5px] border-t-2 ${isTerminal && "border-blue-500"}`} onClick={() => handleConsole(isTerminal)}>
                Terminal
              </button>
            </header>
            {isConsole ?
            <div className="p-3 mt-8">
              {outPut &&
                outPut.map((line: string, i: number) => (
                  <p key={i} className={`${isError && "text-red-500"}`}>
                    {line}
                  </p>
                ))}
            </div>
            :
            <div className="p-3 mt-8">
              <div>
              {terminalOutput.map((item:any, index:any) => (
                <div key={index}>
                  {item.type === 'input' ? (
                    <span>{item.value}</span>
                  ) : (
                    <span className="text-green-500">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
        <form onSubmit={handleInputSubmit}>
          <span>{`${currentDirectory.join('/')}>`}</span>
          <input
            type="text"
            value={terminalInput}
            onChange={handleInputChange}
            className="text-white bg-black/0 focus:outline-none ml-1 w-[1200px]"
            autoFocus
          />
        </form>
          </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const renderTreeItems = (
  items: TreeItemData[],
  handleItemSelect: (id: string, code: string | undefined, directory: any) => void
) => {
  return items.map((item) => (
    <TreeItem
      key={item.id}
      nodeId={item.id}
      label={item.label}
      icon={item.type === "text" && <FaRegFile />}
      collapseIcon={<FaRegFolderOpen />}
      expandIcon={<FaRegFolder />}
      onClick={() => {
        handleItemSelect(item.id, item.code, item.treeDirectory);
      }}
    >
      {item.children && renderTreeItems(item.children, handleItemSelect)}
    </TreeItem>
  ));
};

