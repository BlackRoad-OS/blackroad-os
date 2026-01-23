# Unity Worldbuilder - Procedural Terrain, Inventory & Block Physics

This document provides setup and usage instructions for the new game systems added to the Unity worldbuilder.

## 🎮 New Features

### 1. Procedural Terrain Generation
- **Perlin noise-based height generation** with configurable seed
- **5 Biome types**: Plains, Forest, Desert, Mountains, Snow
- **Layered terrain**: Bedrock → Stone → Dirt → Surface blocks
- **Tree generation** in forest biomes with spherical leaf shapes
- **Configurable parameters** for world size, noise scale, and height

### 2. Inventory System
- **36-slot inventory** (default, configurable)
- **9-slot hotbar** for quick access
- **Stack-based storage** with 64 items per stack (configurable)
- **Event-driven UI updates** for real-time feedback
- **Drag-and-drop ready** architecture
- **Integration with block placement/removal**

### 3. Block Physics System
- **Falling blocks** (sand, gravel) - fall when unsupported
- **Water flow simulation** - spreads to adjacent spaces, prioritizes downward flow
- **Interactive doors** - open/close with sound effects
- **Physics update system** with configurable intervals

---

## 📁 File Structure

```
Assets/Scripts/
├── Inventory/
│   ├── InventorySlot.cs          # Slot data structure
│   └── InventoryManager.cs       # Core inventory logic
├── UI/
│   ├── InventorySlotUI.cs        # Individual slot UI component
│   └── InventoryUI.cs            # Main inventory UI controller
├── World/
│   ├── TerrainGenerator.cs       # Procedural terrain generation
│   ├── PhysicsBlock.cs           # Base class for physics blocks
│   ├── FallingBlock.cs           # Falling block physics
│   ├── WaterBlock.cs             # Water flow simulation
│   └── DoorBlock.cs              # Interactive door blocks
└── Building/
    ├── BlockType.cs              # Updated with category & hardness
    ├── BlockPlacer.cs            # Updated with inventory integration
    └── WorldGrid.cs              # Updated with physics extensions
```

---

## 🎯 Required Block Types

Create these BlockType ScriptableObjects in your BlockDatabase:

| Block ID | Category   | Hardness | Physics Component | Description |
|----------|------------|----------|-------------------|-------------|
| bedrock  | Terrain    | 999      | -                 | Unbreakable base layer |
| stone    | Terrain    | 2        | -                 | Underground layer |
| dirt     | Terrain    | 0.5      | -                 | Sub-surface layer |
| grass    | Terrain    | 0.6      | -                 | Surface grass blocks |
| sand     | Terrain    | 0.5      | FallingBlock      | Falls when unsupported |
| gravel   | Terrain    | 0.6      | FallingBlock      | Falls when unsupported |
| snow     | Terrain    | 0.2      | -                 | Snow biome surface |
| wood     | Terrain    | 1.5      | -                 | Tree trunks |
| leaves   | Decorative | 0.2      | -                 | Tree foliage |
| water    | Terrain    | 0        | WaterBlock        | Flowing water |
| door     | Structure  | 1        | DoorBlock         | Interactive door |

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| **Tab** | Toggle inventory UI |
| **R** | Regenerate terrain with new random seed |
| **E** | Interact with doors/interactive blocks |
| **Left Click** | Place block (requires inventory) |
| **Right Click** | Break block (adds to inventory) |
| **WASD** | Move camera |
| **Mouse** | Look around |
| **Space** | Move up (changed from E) |
| **Q** | Move down |
| **Shift** | Speed boost |
| **Ctrl** | Slow movement |
| **Escape** | Toggle cursor lock |

---

## 🔧 Setup Instructions

### Step 1: Create Block Types

1. In Unity, right-click in Project window → **Create > BlackRoad > Worldbuilder > BlockType**
2. Configure each block type:
   - Set **Block ID** (e.g., "bedrock", "stone", "dirt")
   - Set **Display Name** (e.g., "Bedrock", "Stone", "Dirt")
   - Assign **Prefab** (create simple cube prefabs with materials)
   - Set **Category** (Terrain, Structure, Decorative, Other)
   - Set **Hardness** (0-999)
   - Optionally assign **Icon** sprite for inventory UI

3. For physics blocks, add the appropriate component to the prefab:
   - Sand/Gravel: Add `FallingBlock` component
   - Water: Add `WaterBlock` component
   - Door: Add `DoorBlock` component (set closed/open models)

### Step 2: Create Block Database

1. Right-click in Project → **Create > BlackRoad > Worldbuilder > BlockDatabase**
2. Add all 11 block types to the `blocks` array
3. Ensure each block has a unique `blockId`

### Step 3: Setup Scene

#### Add Core Components:

1. **WorldGrid** (Empty GameObject)
   - Add `WorldGrid.cs` component
   - Set `cellSize` (default: 1)

2. **Main Camera** (should already have `FlyCameraController`)
   - Add `BlockPlacer.cs` component
   - Assign WorldGrid reference
   - Assign BlockDatabase reference

3. **InventoryManager** (Empty GameObject)
   - Add `InventoryManager.cs` component
   - Set inventory size (default: 36)
   - Set hotbar size (default: 9)

4. **TerrainGenerator** (Empty GameObject)
   - Add `TerrainGenerator.cs` component
   - Assign WorldGrid reference
   - Assign BlockDatabase reference
   - Configure world settings:
     - World Width/Depth (default: 100x100)
     - Seed (any integer)
     - Noise Scale (default: 0.05)
     - Height Multiplier (default: 10)
     - Tree spawn chance (default: 0.1)

#### Link BlockPlacer to Inventory:

1. Select Main Camera
2. In BlockPlacer component, assign `InventoryManager` reference

### Step 4: Create Inventory UI

1. Create UI Canvas (if not exists)
   - GameObject → UI → Canvas
   - Set to Screen Space - Overlay

2. **Create Inventory Panel**:
   - Add Panel as child of Canvas
   - Name it "InventoryPanel"
   - Position/size to center of screen
   - Start with SetActive(false)

3. **Create Slot Prefab**:
   - Create UI → Image (name: "InventorySlot")
   - Add child Image (name: "Icon") for block icon
   - Add child Text (name: "Quantity") for stack count
   - Add `InventorySlotUI.cs` component
   - Assign references:
     - Background Image
     - Icon Image
     - Quantity Text
   - Save as prefab and delete from scene

4. **Create Slot Container**:
   - Add Empty GameObject to InventoryPanel (name: "SlotContainer")
   - Add Grid Layout Group component
   - Configure grid (e.g., 9 columns for 36 slots)

5. **Setup InventoryUI**:
   - Add `InventoryUI.cs` to InventoryPanel or Canvas
   - Assign references:
     - InventoryManager
     - BlockDatabase
     - InventoryPanel
     - Slot Prefab
     - Slot Container

---

## 🧪 Testing

### Test Inventory System:
1. Start play mode
2. Press **Tab** to open inventory
3. Cursor should unlock, inventory UI should appear
4. Press **Tab** again to close

### Test Terrain Generation:
1. In TerrainGenerator, click "Generate World" in Inspector (or press Play)
2. World should generate with varied terrain and trees
3. Press **R** during play to regenerate with new seed

### Test Block Placement:
1. Give yourself blocks via code or start with items in inventory
2. Left-click to place blocks (consumes inventory)
3. Right-click to break blocks (adds to inventory)

### Test Block Physics:
1. Place sand/gravel blocks in air - should fall when unsupported
2. Place water blocks - should spread horizontally and downward
3. Place door blocks - press **E** to open/close

---

## 🎨 Customization

### Terrain Generation:
```csharp
// In TerrainGenerator Inspector:
worldWidth = 200;              // Larger world
worldDepth = 200;
seed = 54321;                  // Different terrain pattern
noiseScale = 0.03f;            // Smoother terrain
heightMultiplier = 15;         // Taller mountains
treeSpawnChance = 0.2f;        // More trees
```

### Inventory:
```csharp
// In InventoryManager Inspector:
inventorySize = 45;            // More slots
hotbarSize = 10;               // Larger hotbar
defaultStackSize = 99;         // Bigger stacks
```

### Physics:
```csharp
// In FallingBlock:
_fallSpeed = 5f;               // Faster falling

// In WaterBlock:
_maxSpreadDistance = 10;       // Water flows further
_spreadDelay = 0.5f;           // Faster spreading
```

---

## 🐛 Troubleshooting

### Inventory not opening:
- Ensure InventoryUI has all references assigned
- Check that InventoryPanel starts inactive
- Verify InventoryManager is in scene

### Terrain not generating:
- Check WorldGrid and BlockDatabase are assigned
- Ensure all block IDs exist in database
- Check Console for error messages

### Blocks not placing:
- Verify BlockPlacer has InventoryManager reference
- Check that player has blocks in inventory
- Ensure block prefabs have colliders for raycasting

### Physics not working:
- Verify physics components are on prefabs, not just BlockTypes
- Check that WorldGrid is calling NotifyAdjacentBlocks
- Ensure physics blocks have valid WorldGrid reference

---

## 📝 Code Architecture

### Inventory System:
- **InventorySlot**: Data-only class (no MonoBehaviour)
- **InventoryManager**: Core logic with UnityEvents for UI updates
- **InventoryUI**: Handles Tab key and manages UI state
- **InventorySlotUI**: Individual slot display and click handling

### Terrain Generation:
- **TerrainGenerator**: Stateless generator, can be called multiple times
- Uses Perlin noise for both height and biome distribution
- Generates in two passes: terrain first, then trees

### Block Physics:
- **PhysicsBlock**: Base class with update interval system
- **FallingBlock**: Checks for support, animates falling
- **WaterBlock**: Coroutine-based spreading with flow level tracking
- **DoorBlock**: State machine for open/closed with audio

### Integration Points:
- **BlockPlacer**: Consumes/adds items via InventoryManager
- **WorldGrid**: Notifies adjacent blocks when placing/removing
- All physics blocks auto-find WorldGrid via FindObjectOfType

---

## 🚀 Future Enhancements

Consider adding:
- [ ] Hotbar selection UI with number keys 1-9
- [ ] Block selection menu (instead of just using default)
- [ ] Save/load for inventory state
- [ ] Crafting system
- [ ] More biome types (jungle, tundra, swamp)
- [ ] Cave generation
- [ ] Ore deposits
- [ ] Plant growth system
- [ ] Weather effects
- [ ] Day/night cycle integration

---

## 📚 API Reference

### InventoryManager
```csharp
// Add items to inventory
int added = inventoryManager.AddItem("stone", 10);

// Remove items
int removed = inventoryManager.RemoveItem("stone", 5);

// Check if player has items
bool hasEnough = inventoryManager.HasItem("stone", 5);

// Get specific slot
InventorySlot slot = inventoryManager.GetSlot(0);

// Swap slots (for drag-and-drop)
inventoryManager.SwapSlots(0, 1);

// Listen to changes
inventoryManager.OnInventoryChanged.AddListener(OnSlotChanged);
```

### TerrainGenerator
```csharp
// Generate world
terrainGenerator.GenerateWorld();

// Regenerate with new seed
terrainGenerator.RegenerateWithNewSeed();
```

### BlockPlacer
```csharp
// Change current block
blockPlacer.SetCurrentBlock(blockType);

// Get current block
BlockType current = blockPlacer.GetCurrentBlock();
```

### WorldGrid Physics Extensions
```csharp
// Check if block exists
bool exists = worldGrid.HasBlockAt(gridPos);

// Get block GameObject
GameObject block = worldGrid.GetBlockAt(gridPos);

// Check if block is physics-enabled
bool isPhysics = worldGrid.IsPhysicsBlock(gridPos);

// Notify adjacent blocks of change
worldGrid.NotifyAdjacentBlocks(gridPos);
```

---

## 📄 License

© 2025-2026 BlackRoad OS, Inc.
See LICENSE file for details.
