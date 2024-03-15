import { createSlice } from "@reduxjs/toolkit";
import { TreeItemData } from "../../models/treeItemType";
import { v4 } from "uuid";



type initialData = {
    treeItems: TreeItemData[];
    selectedItem: string | null;
    editorCode?: string | undefined;
  }

const initialState: initialData = {
    treeItems: [],
    selectedItem: "",
    editorCode: "",
}

export const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        addNewFolder: (state, action) => {
           const addFolderToParent = (parentId: string, newFolder: TreeItemData) => {
                const updatedTreeItems:any = state.treeItems.map(item => {
                    if (item.id === parentId && !item.label?.includes(".")) {
                      return {
                        ...item,
                        children: item.children ? [...item.children, newFolder] : [newFolder]
                      };
                    } else if (item.children && !item.label?.includes(".")) {
                      return {
                        ...item,
                        children: addFolderToParentInChild(item.children, parentId, newFolder)
                      };
                    }
                    return item;
                  });
                  state.treeItems = updatedTreeItems;
            }
           const addFolderToParentInChild = (children: TreeItemData[], parentId: string, newFolder: TreeItemData): TreeItemData[] => {
                return children.map(child => {
                    if (child.id === parentId && !child.label?.includes(".")) {
                        return {
                          ...child,
                          children: child.children ? [...child.children, newFolder] : [newFolder]
                        };
                      } else if (child.children && !child.label?.includes(".")) {
                        return {
                          ...child,
                          children: addFolderToParentInChild(child.children, parentId, newFolder)
                        };
                      }
                      return child;
                })
            }

            if(action.payload?.includes(".")) return;
            const newFolder: TreeItemData = {
                id: v4(),
                label: action.payload,
                icon: "",
                code: "",
                children: [],
            }
            if(state.selectedItem){
                addFolderToParent(state.selectedItem, newFolder);
            }else{
              state.treeItems.push(newFolder);
            }
        },
        addNewFile: (state, action) => {
            const addFolderToParent = (parentId: string, newFolder: TreeItemData) => {
                const updatedTreeItems:any = state.treeItems.map(item => {
                    if (item.id === parentId && !item.label?.includes(".")) {
                      return {
                        ...item,
                        children: item.children ? [...item.children, newFolder] : [newFolder]
                      };
                    } else if (item.children && !item.label?.includes(".")) {
                      return {
                        ...item,
                        children: addFolderToParentInChild(item.children, parentId, newFolder)
                      };
                    }
                    return item;
                  });
                  state.treeItems = updatedTreeItems;
            }
           const addFolderToParentInChild = (children: TreeItemData[], parentId: string, newFolder: TreeItemData): TreeItemData[] => {
                return children.map(child => {
                    if (child.id === parentId && !child.label?.includes(".")) {
                        return {
                          ...child,
                          children: child.children ? [...child.children, newFolder] : [newFolder]
                        };
                      } else if (child.children && !child.label?.includes(".")) {
                        return {
                          ...child,
                          children: addFolderToParentInChild(child.children, parentId, newFolder)
                        };
                      }
                      return child;
                })
            }

            if(action.payload?.includes(".")){
                const newFolder: TreeItemData = {
                  id: v4(),
                  label: action.payload,
                  code:  "",
                  icon: "file",
                };
                if (state.selectedItem) {
                    addFolderToParent(state.selectedItem, newFolder);
                } else {
                   state.treeItems.push(newFolder);
                }
              }
        },
        deleteItem: (state, action) => {
            const deleteItemFromTree = (items: TreeItemData[], itemId: string | null): TreeItemData[] => {
                return items.filter((item) => {
                  if (item.id === itemId) {
                    return false;
                  } else if (item.children) {
                    item.children = deleteItemFromTree(item.children, itemId);
                    if (item.children.length === 0) {
                      delete item.children;
                    }
                  }
                  return true;
                });
              };

              const updatedTreeItems = deleteItemFromTree(state.treeItems, action.payload);
              state.treeItems = updatedTreeItems;
        },
        selectItem: (state, action) => {
            state.selectedItem = action.payload;
        },
        updateCode: (state, action) => {
          const test = (items: TreeItemData[], itemId: string | null) => {
            return items.filter((item) => {
              if(item.id === itemId){
                item.code = state.editorCode;
                state.editorCode = "";
              }else if(item.children){
                item.children = test(item.children, itemId);
                if(item.children.length === 0){
                  delete item.children;
                }
              }
              return true;
            })
          }
          const updateCodeItem = test(state.treeItems, action.payload);
          state.treeItems = updateCodeItem;
        },
        getEditorCode: (state, action) => {
            state.editorCode = action.payload;
        }
    }
})


export const { addNewFolder, addNewFile, selectItem, deleteItem, updateCode, getEditorCode } = editorSlice.actions;
export default editorSlice.reducer;