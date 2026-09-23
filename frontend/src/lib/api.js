import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const projectsApi = {
  list: () => axios.get(`${API}/projects`).then((r) => r.data),
  create: (body) => axios.post(`${API}/projects`, body).then((r) => r.data),
  update: (id, body) => axios.put(`${API}/projects/${id}`, body).then((r) => r.data),
  remove: (id) => axios.delete(`${API}/projects/${id}`),
};

export const snippetsApi = {
  list: () => axios.get(`${API}/snippets`).then((r) => r.data),
  create: (body) => axios.post(`${API}/snippets`, body).then((r) => r.data),
  remove: (id) => axios.delete(`${API}/snippets/${id}`),
};

export const modelApi = {
  inspect: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axios.post(`${API}/model/inspect`, fd).then((r) => r.data);
  },
  exportZip: ({ file, name, mode, category, facing, targetLength, fmt, layout, texture, icon }) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name);
    fd.append("mode", mode);
    fd.append("category", category);
    fd.append("facing", facing);
    fd.append("target_length", String(targetLength));
    fd.append("fmt", fmt);
    fd.append("layout", layout);
    if (texture) fd.append("texture", texture);
    if (icon) fd.append("icon", icon);
    return axios.post(`${API}/model/export`, fd, { responseType: "blob" }).then((r) => r.data);
  },
};

export const PROJECT_TYPES = ["Creature", "Weapon", "Block", "Item"];
export const PROJECT_STATUSES = ["Idea", "Model Made", "Textured", "In-Game Tested", "Done"];
