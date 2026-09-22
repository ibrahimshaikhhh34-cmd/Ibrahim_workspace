const KNOWN = [
  {
    re: /Not Found Res \[Models\/([^\]]+)\]/i,
    title: (m) => `Missing model: ${m[1]}`,
    fix: (m) => `${m[1].split("/").pop()}.dae is missing or misnamed in the Models folder. Check the exact file name (case matters) and that the path inside your XML is "Models/${m[1]}".`,
    kind: "model",
  },
  {
    re: /Not Found Res \[(Textures\/[^\]]+)\]/i,
    title: (m) => `Missing texture: ${m[1].split("/").pop()}`,
    fix: (m) => `The texture PNG is missing or misnamed at exactly "${m[1]}.png". Make sure the folder (Creatures / Items / Blocks) and the file name match the XML character for character.`,
    kind: "texture",
  },
  {
    re: /Error creating entity from template\s*"?([A-Za-z0-9_\-.]+)"?/i,
    title: (m) => `Broken entity template: ${m[1]}`,
    fix: (m) => `The XML for template "${m[1]}" is broken. Open its definition and look for a missing attribute, a typo in a component name, or a value with the wrong type (e.g. text where a number is expected).`,
    kind: "template",
  },
  {
    re: /Exception measuring widget of type Game\.BestiaryScreen/i,
    title: () => "Bestiary screen failed to render",
    fix: () => "Usually a bestiary entry points to a model or texture that doesn't exist. Check every creature listed in the bestiary has a valid ModelName and TextureName file.",
    kind: "bestiary",
  },
];

const stripPrefix = (line) =>
  line
    .replace(/^\[?\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}[.,]?\d*\]?\s*/, "")
    .replace(/^\d{2}:\d{2}:\d{2}[.,]?\d*\s*/, "")
    .trim();

const isErrorLine = (l) => /\b(ERROR|Exception|FATAL|Failed|Unhandled)\b/i.test(l) && !/^\s+at\s/.test(l);
const isTraceLine = (l) => /^\s+at\s|^\s+---|^\s+in\s|^\s*\w+Exception:/.test(l);

export const parseLog = (text) => {
  const lines = text.replace(/\r/g, "").split("\n");
  const groups = new Map();
  let current = null;

  for (const raw of lines) {
    if (!raw.trim()) {
      current = null;
      continue;
    }
    if (isErrorLine(raw)) {
      const message = stripPrefix(raw);
      const key = message.replace(/0x[0-9a-f]+/gi, "0x…").replace(/\d{3,}/g, "#");
      if (!groups.has(key)) {
        const known = KNOWN.map((k) => ({ k, m: message.match(k.re) })).find((x) => x.m);
        groups.set(key, {
          id: key,
          message,
          count: 0,
          trace: [],
          known: known ? { kind: known.k.kind, title: known.k.title(known.m), fix: known.k.fix(known.m) } : null,
        });
      }
      current = groups.get(key);
      current.count += 1;
    } else if (current && isTraceLine(raw)) {
      if (current.count === 1 && current.trace.length < 40) current.trace.push(raw.trim());
    } else {
      current = null;
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
};

export const SAMPLE_LOG = `2025-03-02 18:22:01.115 INFO: Survivalcraft 2.3.7.0 starting
2025-03-02 18:22:04.302 ERROR: Not Found Res [Models/FrostWolf]
   at Engine.Content.ContentManager.Get(Type type, String name)
   at Game.SubsystemModelsStorage.GetModel(String name)
2025-03-02 18:22:04.310 ERROR: Not Found Res [Models/FrostWolf]
   at Engine.Content.ContentManager.Get(Type type, String name)
2025-03-02 18:22:05.001 ERROR: Not Found Res [Textures/Creatures/FrostWolf]
   at Engine.Content.ContentManager.Get(Type type, String name)
2025-03-02 18:22:07.220 ERROR: Error creating entity from template "IceGolem"
   at Game.DatabaseManager.CreateEntity(String templateName)
   at Game.SubsystemSpawn.SpawnCreature(String templateName)
2025-03-02 18:22:07.220 ERROR: Error creating entity from template "IceGolem"
2025-03-02 18:22:07.221 ERROR: Error creating entity from template "IceGolem"
2025-03-02 18:22:09.412 ERROR: Exception measuring widget of type Game.BestiaryScreen
   at Engine.Widget.Measure(Vector2 parentAvailableSize)
2025-03-02 18:22:11.000 ERROR: System.NullReferenceException: Object reference not set to an instance of an object.
   at Game.ComponentMiner.Hit(ComponentBody body, Vector3 hitPoint, Vector3 hitDirection)
   at Game.ComponentMiner.Update(Single dt)
2025-03-02 18:22:15.000 INFO: World saved`;
