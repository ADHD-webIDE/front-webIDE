import Monaco from "@monaco-editor/react";
import { useAppSelector } from "../store/hook";
import { useEffect, useRef, useState } from "react";
import { CODE_SNIPPETS } from "../option";
import { checkCode } from "../api/consoleApi";
import "../custom-scrollbar.css";
import { TreeView } from "@mui/x-tree-view";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
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
  selectItem,
  updateCode,
  getEditorCode,
} from "../store/editorSlice/editorSlice";


export default function Editor() {
  const { title, stack, performance } = useAppSelector(
    (state) => state.container.clickedContainer
  );
  const [value, setValue] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [outPut, setOutput] = useState([]);
  const editorRef = useRef<any>();

  const dispatch = useDispatch();
  const treeItems = useAppSelector((state) => state.editor.treeItems);
  const selectedItem = useAppSelector((state) => state.editor.selectedItem);
  const editorCode = useAppSelector((state) => state.editor.editorCode);
 
  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await checkCode(stack, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const savedCode = () => { 
    dispatch(updateCode(selectedItem));
  };

  const handleFolderSelect = (id: string, code: string | undefined) => {
    dispatch(selectItem(id));
    setValue(code);
  };

  const handleAddFolder = () => {
    const input = prompt("폴더명을 입력해주세요.");
    dispatch(addNewFolder(input));
  };
  const handleAddFile = () => {
    const input = prompt("파일명을 입력해주세요.");
    dispatch(addNewFile(input));
  };
  const handleDelete = () => {
    dispatch(deleteItem(selectedItem));
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.MuiTreeView-root')) {
        dispatch(selectItem(null));
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="text-white w-screen h-screen">
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
            <div className="ml-2">
              {title}
            </div>
            <div className="mr-2">
              <button className="mr-1 text-[20px]" onClick={handleAddFolder}>
                <RiFolderAddLine />
              </button>
              <button className="mr-1 text-[20px]" onClick={handleAddFile}>
                <AiOutlineFileAdd />
              </button>
              <button className="mr-1 text-[20px]" onClick={handleDelete}>
                <RiDeleteBinLine />
              </button>
            </div>
          </div>
          <div className="h-[96%]">
            <div>
              <TreeView
                aria-label="file system navigator"
                defaultCollapseIcon={<FaRegFolderOpen />}
                defaultParentIcon={<FaRegFolder />}
                defaultExpandIcon={<FaRegFolder />}
              >
                {renderTreeItems(treeItems, handleFolderSelect)}
              </TreeView>
            </div>
          </div>
        </nav>

        {/* 편집기 */}
        <div className="w-[85%]">
          <div className="h-[70%]">
            <Monaco
              theme="vs-dark"
              language={stack}
              // defaultValue={CODE_SNIPPETS[stack]}
              value={value}
              onChange={(value) => dispatch(getEditorCode(value))}
              onMount={onMount}
            />
          </div>

          {/* 콘솔 */}
          <div className="h-[30%] overflow-y-auto">
            <header className="w-full bg-black flex items-center fixed">
              <div className="bg-black w-[100px] p-[5px] border-t-2 border-blue-500">
                Console
              </div>
            </header>
            <div className="p-3 mt-8">
              {outPut &&
                outPut.map((line: string, i: number) => (
                  <p key={i} className={`${isError && "text-red-500"}`}>
                    {line}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const renderTreeItems = (items: TreeItemData[], handleFolderSelect: (id: string, code: string | undefined) => void
) => {
  return items.map((item) => (
    <TreeItem
      key={item.id}
      nodeId={item.id}
      label={item.label}
      icon={item.icon && <FaRegFile/>}
      defaultValue={item.code}
      onClick={() => {
        handleFolderSelect(item.id, item.code);
      }}
    >
      {item.children && renderTreeItems(item.children, handleFolderSelect)}
    </TreeItem>
  ));
};