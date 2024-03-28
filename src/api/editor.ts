import axios from "axios";

export const getConsole = async (fileName: string | undefined, taskArn: string, containerName: string) => {
    try {
        const result = await axios.post('https://2716-112-218-243-204.ngrok-free.app/api/containers/exec-code', {
            fileName,
            taskArn,
            containerName,
        });
        return result.data;
    }catch (err) {
        return console.error(err);
    }
}

export const commandTest = async (username: string, command: string, taskArn: string, containerName: string) => {
    try {
        const result = await axios.post('https://2716-112-218-243-204.ngrok-free.app/api/containers/exec', {
            username,
            command,
            taskArn,
            containerName,
        });
        return result.data;
    }catch (err) {
        return console.error(err);
    }
}

export const treeCommand = async (username: string, command: string, taskArn: string, containerName: string) => {
    try {
        const result = await axios.post('https://2716-112-218-243-204.ngrok-free.app/api/containers/exec2', {
            username,
            command,
            taskArn,
            containerName,
        });
        return result.data;
    }catch (err) {
        return console.error(err);
    }
}

export const createCommand = async (username: string, command: string | undefined, taskArn: string, containerName: string, path: string | undefined) => {
    try {
        const result = await axios.post('https://2716-112-218-243-204.ngrok-free.app/api/containers/exec3', {
            username,
            command,
            taskArn,
            containerName,
            path,
        });
        return result.data;
    }catch (err) {
        return console.error(err);
    }
}

export const getContainerData = async () => {
    try {
        const result = await axios.get('https://2716-112-218-243-204.ngrok-free.app/api/containers/tes-zxcTesService/tasks');
        return result.data;
    }catch (err) {
        return console.error(err);
    }
}