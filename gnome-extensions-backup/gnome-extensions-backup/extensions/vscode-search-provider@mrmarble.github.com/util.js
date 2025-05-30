import Glib from "gi://GLib";
export const uniqueId = () => [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
export const readFile = (path) => {
    const [ok, data] = Glib.file_get_contents(path);
    if (!ok) {
        return;
    }
    return new TextDecoder().decode(data);
};
export const fileExists = (path) => Glib.file_test(path, Glib.FileTest.EXISTS);
