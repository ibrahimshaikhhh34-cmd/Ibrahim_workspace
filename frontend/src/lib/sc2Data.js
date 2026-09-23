// Real Survivalcraft 2 (Content 2.4) structures supplied by the user. Field names are never invented.

export const BLOCK_COLUMNS = [
  ["Class Name", "string"], ["DefaultDisplayName", "string"], ["DefaultCategory", "string"], ["Behaviors", "string"],
  ["DisplayOrder", "int"], ["DefaultIconBlockOffset", "Vector3"], ["DefaultIconViewOffset", "Vector3"], ["DefaultIconViewScale", "float"],
  ["FirstPersonScale", "float"], ["FirstPersonOffset", "Vector3"], ["FirstPersonRotation", "Vector3"], ["InHandScale", "float"],
  ["InHandOffset", "Vector3"], ["InHandRotation", "Vector3"], ["CraftingId", "string"], ["DefaultCreativeData", "int"],
  ["IsCollidable", "bool"], ["IsPlaceable", "bool"], ["IsDiggingTransparent", "bool"], ["IsPlacementTransparent", "bool"],
  ["DefaultIsInteractive", "bool"], ["IsEditable", "bool"], ["IsNonDuplicable", "bool"], ["IsGatherable", "bool"],
  ["HasCollisionBehavior", "bool"], ["KillsWhenStuck", "bool"], ["IsFluidBlocker", "bool"], ["IsTransparent", "bool"],
  ["GenerateFacesForSameNeighbors", "bool"], ["DefaultShadowStrength", "int"], ["LightAttenuation", "int"], ["DefaultEmittedLightAmount", "int"],
  ["ObjectShadowStrength", "float"], ["DefaultDropContent", "string"], ["DefaultDropCount", "float"], ["DefaultExperienceCount", "float"],
  ["RequiredToolLevel", "int"], ["MaxStacking", "int"], ["SleepSuitability", "float"], ["FrictionFactor", "float"],
  ["Density", "float"], ["NoAutoJump", "bool"], ["NoSmoothRise", "bool"], ["FuelHeatLevel", "int"],
  ["FuelFireDuration", "float"], ["DefaultSoundMaterialName", "string"], ["ShovelPower", "float"], ["QuarryPower", "float"],
  ["HackPower", "float"], ["DefaultMeleePower", "float"], ["DefaultMeleeHitProbability", "float"], ["DefaultProjectilePower", "float"],
  ["ToolLevel", "int"], ["PlayerLevelRequired", "int"], ["Durability", "int"], ["IsAimable", "bool"],
  ["IsStickable", "bool"], ["AlignToVelocity", "bool"], ["ProjectileSpeed", "float"], ["ProjectileDamping", "float"],
  ["ProjectileTipOffset", "float"], ["DisintegratesOnHit", "bool"], ["ProjectileStickProbability", "float"], ["DefaultHeat", "float"],
  ["FireDuration", "float"], ["ExplosionResilience", "float"], ["DefaultExplosionPressure", "float"], ["DefaultExplosionIncendiary", "bool"],
  ["ExplosionKeepsPickables", "bool"], ["DigMethod", "BlockDigMethod"], ["DigResilience", "float"], ["ProjectileResilience", "float"],
  ["DefaultNutritionalValue", "float"], ["DefaultSicknessProbability", "float"], ["FoodType", "FoodType"], ["DefaultRotPeriod", "int"],
  ["DefaultTextureSlot", "int"], ["DestructionDebrisScale", "float"], ["DefaultDescription", "string"],
];

export const BLOCK_GROUPS = [
  ["Identity", ["Class Name", "DefaultDisplayName", "DefaultCategory", "Behaviors", "DisplayOrder", "CraftingId", "DefaultCreativeData", "DefaultDescription"]],
  ["Appearance", ["DefaultTextureSlot", "DefaultIconBlockOffset", "DefaultIconViewOffset", "DefaultIconViewScale", "FirstPersonScale", "FirstPersonOffset", "FirstPersonRotation", "InHandScale", "InHandOffset", "InHandRotation", "DestructionDebrisScale"]],
  ["Flags", ["IsCollidable", "IsPlaceable", "IsDiggingTransparent", "IsPlacementTransparent", "DefaultIsInteractive", "IsEditable", "IsNonDuplicable", "IsGatherable", "HasCollisionBehavior", "KillsWhenStuck", "IsFluidBlocker", "IsTransparent", "GenerateFacesForSameNeighbors", "NoAutoJump", "NoSmoothRise"]],
  ["Light & Shadow", ["DefaultShadowStrength", "LightAttenuation", "DefaultEmittedLightAmount", "ObjectShadowStrength"]],
  ["Drops & Inventory", ["DefaultDropContent", "DefaultDropCount", "DefaultExperienceCount", "RequiredToolLevel", "MaxStacking", "SleepSuitability"]],
  ["Physics & Sound", ["FrictionFactor", "Density", "DefaultSoundMaterialName", "FuelHeatLevel", "FuelFireDuration"]],
  ["Tool & Combat", ["ShovelPower", "QuarryPower", "HackPower", "DefaultMeleePower", "DefaultMeleeHitProbability", "DefaultProjectilePower", "ToolLevel", "PlayerLevelRequired", "Durability"]],
  ["Projectile", ["IsAimable", "IsStickable", "AlignToVelocity", "ProjectileSpeed", "ProjectileDamping", "ProjectileTipOffset", "DisintegratesOnHit", "ProjectileStickProbability"]],
  ["Fire, Explosion & Digging", ["DefaultHeat", "FireDuration", "ExplosionResilience", "DefaultExplosionPressure", "DefaultExplosionIncendiary", "ExplosionKeepsPickables", "DigMethod", "DigResilience", "ProjectileResilience"]],
  ["Food", ["DefaultNutritionalValue", "DefaultSicknessProbability", "FoodType", "DefaultRotPeriod"]],
];

export const BLOCK_EXAMPLE_ROW =
  "CobblestoneBlock;Cobblestone;Construction;;73;0,0,0;1, 1, 1;1;0.4;0.5, -0.5, -0.6;0, 40, 0;0.3;0,0.12,0;0, 0, 45;cobblestone;0;TRUE;TRUE;FALSE;FALSE;FALSE;FALSE;FALSE;FALSE;FALSE;FALSE;TRUE;FALSE;FALSE;15;0;0;1;#;1;;0;40;0;1;3;FALSE;FALSE;0;0;Stone;1;1;1;1;;2;1;;-1;FALSE;FALSE;FALSE;0;;0;FALSE;0;;0;140;;;;Quarry;14;1;;;;;16;1;Cobblestone is a tough stone obtained by mining granite. It is a strong, rugged material that works well when used in construction of walls and floors. By smelting it in a furnace you can obtain pure granite of which it is made. Can be painted.";

export const ITEM_EXAMPLE_ROW =
  "ChestBlock;Chest;Items;;122;0,0,0;1, 1, 1;1;0.4;0.5, -0.5, -0.6;0, 40, 0;0.3;0,0.12,0;0, 0, 45;chest;0;TRUE;TRUE;FALSE;FALSE;TRUE;FALSE;FALSE;FALSE;FALSE;FALSE;TRUE;FALSE;FALSE;15;0;0;1;#;1;;0;1;0.5;1;0.5;FALSE;FALSE;1;5;Wood;1;1;1;1;;1;1;;-1;FALSE;FALSE;FALSE;0;;0;FALSE;0.95;;20;5;;;;Hack;5;1;;;;;4;1;A chest made of wood is a good place to store excess items that you can't or don't want to carry. It will hold up to 16 stacks of items";

export const parseBlockRow = (row) => {
  const parts = row.split(";");
  const trailing = parts.slice(BLOCK_COLUMNS.length).join(";");
  return Object.fromEntries(BLOCK_COLUMNS.map(([name], i) => [name, i === BLOCK_COLUMNS.length - 1 && trailing ? `${parts[i]};${trailing}` : parts[i] ?? ""]));
};

export const buildBlockRow = (values) => BLOCK_COLUMNS.map(([name]) => (values[name] ?? "").replace(/[\r\n]+/g, " ")).join(";");

export const CREATURE_EXAMPLE_XML = `<EntityTemplate Name="Lion" Guid="9430a185-85a1-426c-8bbb-1e681f9413f9" InheritanceParent="e4275171-a39f-413f-8888-4c472868364d">
  <MemberComponentTemplate Name="FeedBehavior" Guid="0231b16f-481e-4a57-89e6-4a5026495a3a" InheritanceParent="3d5c9b46-1592-45de-ae90-9d050021a5ad">
    <Parameter Name="AutoFeed" Guid="582588ab-a0e1-40e3-9953-7e105d86818e" Value="False" Type="bool" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="FourLeggedModel" Guid="18eda354-6f37-40d4-8936-e7c79f45236e" InheritanceParent="76d24f74-5f25-4d30-92ef-658c1a4d66c8">
    <Parameter Name="CanTrot" Guid="03a2759a-2391-46cb-9101-fb8245bf4c76" Value="True" Type="bool" />
    <Parameter Name="WalkBobHeight" Guid="2109cd73-e3ab-4994-8026-5783bf7a1cf6" Value="0.03" Type="float" />
    <Parameter Name="CanterLegsAngleFactor" Guid="566bea31-da99-49f2-acb5-5e3aed5879cd" Value="1.65" Type="float" />
    <Parameter Name="UseCanterSound" Guid="5ed3e28a-248d-439e-b1cf-f6a30b2a8592" Value="False" Type="bool" />
    <Parameter Name="ModelName" Guid="75995131-7275-4f2f-ae7c-b2f72f38c7c9" Value="Models/Lion" Type="string" />
    <Parameter Name="WalkAnimationSpeed" Guid="7ebaa0bc-d0dc-4498-ac09-a8e874a4a958" Value="0.6" Type="float" />
    <Parameter Name="WalkHindLegsAngle" Guid="c413e42d-edc9-4e4a-ba6c-a8b65d830705" Value="0.4" Type="float" />
    <Parameter Name="WalkFrontLegsAngle" Guid="d063a712-c456-4a78-94aa-e010d3f3ba6e" Value="0.55" Type="float" />
    <Parameter Name="TextureOverride" Guid="fb9f784f-c1ef-40aa-a921-097a0bc59b71" Value="Textures/Creatures/Lion" Type="string" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="Miner" Guid="46ab77a3-58cd-4457-9072-d7733c311fdb" InheritanceParent="8acca888-ba39-464f-bcf5-6ae15e448c62">
    <Parameter Name="AttackPower" Guid="e8537845-827b-4234-bb57-b55e9d4f7f3e" Value="3.5" Type="float" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="ChaseBehavior" Guid="470b1156-830b-4324-99f2-fb292d2897f5" InheritanceParent="31894441-d90a-4549-9264-db9dbe20e234">
    <Parameter Name="ChaseNonPlayerProbability" Guid="0bb18f7f-f70a-46c5-9518-3c93650cde1e" Value="0.03" Type="float" />
    <Parameter Name="DayChaseRange" Guid="1bb139b5-e29f-4c10-8723-c7c09b81b613" Value="8" Type="float" />
    <Parameter Name="NightChaseRange" Guid="292b517b-d23b-4390-8add-057bf72fe8bb" Value="10" Type="float" />
    <Parameter Name="NightChaseTime" Guid="8dd894fb-9873-4753-b881-f7c6c5e6084f" Value="15" Type="float" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="Creature" Guid="492c92fa-eb11-457f-8fea-459ef4fe1d2b">
    <Parameter Name="Description" Guid="379059ff-499b-44a6-a167-65889be34e99" Value="A large cat. Powerful and fast, likes to hunt at night. Larger than Leopard or Jaguar, but not as dangerous as Tiger." Type="string" />
    <Parameter Name="KillVerbs" Guid="5fef0879-5e36-41f8-b8d4-7f6bf2805750" Value="hunted,eaten" Type="string" />
    <Parameter Name="Category" Guid="8ac038cc-a8ea-486b-a7a3-7f6bb98ef749" Value="LandPredator" Type="Game.CreatureCategory" />
    <Parameter Name="DisplayName" Guid="908c6076-6839-4c76-b377-cae0e1bf826e" Value="Lion" Type="string" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="Health" Guid="644ccc2f-95bf-4888-a3cc-c799ba910ad6">
    <Parameter Name="AttackResilience" Guid="09928518-be76-4738-890c-b6af6dff49a9" Value="40" Type="float" />
    <Parameter Name="FireResilience" Guid="848889a4-91f7-4696-9bfd-373921757b65" Value="15" Type="float" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="WalkAroundBehavior" Guid="67eb17c9-6c2f-4c15-be0c-ee7a9c490a5f" InheritanceParent="aebb86ce-4ee6-4ca0-850d-cd60051e1d71" />
  <MemberComponentTemplate Name="OnFire" Guid="6a069da7-399c-4afc-b571-f4d9303ec102" />
  <MemberComponentTemplate Name="Body" Guid="6b9338ad-e8ec-4076-9738-018078f01d7b">
    <Parameter Name="BoxSize" Guid="30f342fe-78e9-4372-84ec-f9bc0acacfd7" Value="0.95,0.95,0.95" Type="Vector3" />
    <Parameter Name="Mass" Guid="cea5155d-61c9-4145-a607-2708af026495" Value="200" Type="float" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="CreatureSounds" Guid="94f38cb9-25c6-4966-a9ed-d156e29f13c4">
    <Parameter Name="IdleSound" Guid="14b7d439-ad78-46f0-961d-3665f6c601e8" Value="Audio/Creatures/LionIdle" Type="string" />
    <Parameter Name="AttackSound" Guid="30f22486-57f5-43f0-8c7e-c581db877745" Value="Audio/Creatures/LionRoar" Type="string" />
    <Parameter Name="PainSound" Guid="a656a2ac-35d6-444b-a8d2-bb2e9fbdfe25" Value="Audio/Creatures/LionRoar" Type="string" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="Loot" Guid="9fddcc10-1bf6-4034-8430-e74ea68dcfbb">
    <ParameterSet Name="Loot" Guid="236a99d6-e535-4411-88c1-c2a65ca4beb5">
      <Parameter Name="1" Guid="d7b7995b-43b8-43af-9901-90076b9e630d" Value="LeatherBlock;1;1" Type="string" />
      <Parameter Name="2" Guid="fd689d53-f99d-475a-9e2f-61200742ae83" Value="RottenMeatBlock;1;1;0.5" Type="string" />
    </ParameterSet>
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="EatPickableBehavior" Guid="a2f5d1a9-8ceb-449e-97c1-ecc224d0bf6d">
    <ParameterSet Name="FoodFactors" Guid="40152ab3-c4a6-404d-92fa-b8e934cea96f">
      <Parameter Name="Fish" Guid="4062f03a-0b65-4851-b81b-88cf2840aee4" Value="1" Type="float" />
      <Parameter Name="Meat" Guid="b117b2bb-74b8-4de5-98cd-e1d2f1e16616" Value="1" Type="float" />
    </ParameterSet>
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="AvoidPlayerBehavior" Guid="ce4d5c7e-222c-496b-82cf-e74259e98986" InheritanceParent="3942e891-6b50-467c-8da5-a15bc63e59e0">
    <Parameter Name="NightRange" Guid="5ddd1da2-cdf1-4ce7-bc29-d6b7b191b094" Value="0" Type="float" />
    <Parameter Name="DayRange" Guid="6f74ed1c-ae21-456b-9ab3-b1237f5cc3c2" Value="12" Type="float" />
  </MemberComponentTemplate>
  <MemberComponentTemplate Name="FindPlayerBehavior" Guid="dc53c311-a1a4-449e-a41c-a0fa6b3875c7" InheritanceParent="44c9a961-258c-4eb3-81d1-d3ae249ae031" />
  <MemberComponentTemplate Name="AvoidFireBehavior" Guid="f5c17875-5e49-4b9b-90c0-1837d4b994db" InheritanceParent="885b2df5-b47b-4c53-bda0-5c1a0c988a3c" />
  <MemberComponentTemplate Name="Locomotion" Guid="fda9d374-e7ef-4b8d-b17c-3cc484649a9d">
    <Parameter Name="AccelerationFactor" Guid="0a1775b5-9ffe-49ad-97f1-f9e43cdd7cb5" Value="0.75" Type="float" />
    <Parameter Name="TurnSpeed" Guid="302216d4-96be-4870-ab49-80218ead2d12" Value="6" Type="float" />
    <Parameter Name="LadderSpeed" Guid="77eacaa9-e2a0-4c02-99b4-18aea534bcc8" Value="0" Type="float" />
    <Parameter Name="FlySpeed" Guid="816c626a-bc48-4593-a186-94853e546265" Value="0" Type="float" />
    <Parameter Name="WalkSpeed" Guid="f9b94f45-7092-484b-9460-0375b45f15bd" Value="4.7" Type="float" />
  </MemberComponentTemplate>
  <ParameterSet Name="CreatureEggData" Guid="58df160b-42f1-4be0-be23-14f18f57ef22">
    <Parameter Name="Color" Guid="0532865b-ff05-41a0-a889-ea7af8a7ae9f" Value="224,138,39" Type="Color" />
    <Parameter Name="EggTypeIndex" Guid="40410b86-86cb-4fbe-8483-1e71becdf8ee" Value="26" Type="int" />
    <Parameter Name="DisplayName" Guid="4b4e6800-729c-4352-9eb8-8516b3fe700e" Value="Lion" Type="string" />
    <Parameter Name="SwapUV" Guid="7d464535-911e-4f4c-a08a-9b423efeb030" Value="False" Type="bool" />
    <Parameter Name="TextureSlot" Guid="a855426c-a90a-4368-8528-1ac43125ea1c" Value="163" Type="int" />
  </ParameterSet>
</EntityTemplate>`;

export const RECIPE_EXAMPLE = {
  Result: "IronAxeBlock", ResultCount: "1", RequiredHeatLevel: "0", RequiredPlayerLevel: "3",
  a: "stick", b: "ironingot", c: "", Description: "Make an iron tool",
  rows: ["bb", "ba", " a"],
};

export const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 0x3) | 0x8).toString(16); }));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export const buildRecipe = ({ Result, ResultCount, RequiredHeatLevel, RequiredPlayerLevel, a, b, c, Description, rows }) => {
  const attrs = [`Result="${esc(Result)}"`, `ResultCount="${esc(ResultCount)}"`, `RequiredHeatLevel="${esc(RequiredHeatLevel)}"`];
  if (RequiredPlayerLevel !== "") attrs.push(`RequiredPlayerLevel="${esc(RequiredPlayerLevel)}"`);
  for (const [k, v] of [["a", a], ["b", b], ["c", c]]) if (v) attrs.push(`${k}="${esc(v)}"`);
  attrs.push(`Description="${esc(Description)}"`);
  const body = rows.filter((r) => r.trim() !== "").map((r) => `  "${r}"`).join("\n");
  return `<Recipe ${attrs.join(" ")}>\n${body}\n</Recipe>`;
};

// Creature template: collect every Parameter Value + identity attributes; regenerate GUIDs on output.
export const parseCreature = (xml) => {
  const doc = new DOMParser().parseFromString(xml.trim(), "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML");
  const root = doc.documentElement;
  const fields = [{ id: "@Name", group: "EntityTemplate", label: "Name", type: "string", value: root.getAttribute("Name") || "" }];
  if (root.hasAttribute("InheritanceParent")) fields.push({ id: "@InheritanceParent", group: "EntityTemplate", label: "InheritanceParent", type: "guid", value: root.getAttribute("InheritanceParent") });
  const params = Array.from(root.getElementsByTagName("Parameter"));
  params.forEach((p, i) => {
    const owner = p.parentElement;
    const grand = owner.parentElement;
    const group = grand && grand !== root ? `${grand.getAttribute("Name")} › ${owner.getAttribute("Name")}` : owner.getAttribute("Name");
    fields.push({ id: `p${i}`, group, label: p.getAttribute("Name"), type: p.getAttribute("Type") || "string", value: p.getAttribute("Value") ?? "" });
  });
  return fields;
};

export const buildCreature = (xml, values, freshGuids) => {
  const doc = new DOMParser().parseFromString(xml.trim(), "application/xml");
  const root = doc.documentElement;
  root.setAttribute("Name", values["@Name"] ?? root.getAttribute("Name"));
  if (values["@InheritanceParent"] !== undefined) root.setAttribute("InheritanceParent", values["@InheritanceParent"]);
  Array.from(root.getElementsByTagName("Parameter")).forEach((p, i) => { if (values[`p${i}`] !== undefined) p.setAttribute("Value", values[`p${i}`]); });
  if (freshGuids) for (const el of [root, ...Array.from(root.getElementsByTagName("*"))]) if (el.hasAttribute("Guid")) el.setAttribute("Guid", uuid());
  const out = [];
  const walk = (node, level) => {
    const pad = "  ".repeat(level);
    const attrs = Array.from(node.attributes).map((x) => ` ${x.name}="${esc(x.value)}"`).join("");
    if (node.children.length === 0) return out.push(`${pad}<${node.tagName}${attrs} />`);
    out.push(`${pad}<${node.tagName}${attrs}>`);
    for (const c of Array.from(node.children)) walk(c, level + 1);
    out.push(`${pad}</${node.tagName}>`);
  };
  walk(root, 0);
  return out.join("\n");
};
