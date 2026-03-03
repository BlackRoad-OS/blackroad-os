# Unity Worldbuilder - Quick Start Guide

## 🎯 Quick Setup (5 Minutes)

### 1. Create Block Types (1 min)
```
Right-click → Create → BlackRoad → Worldbuilder → BlockType
```
Create 11 blocks: bedrock, stone, dirt, grass, sand, gravel, snow, wood, leaves, water, door

### 2. Create Block Database (30 sec)
```
Right-click → Create → BlackRoad → Worldbuilder → BlockDatabase
Add all 11 BlockTypes to the array
```

### 3. Setup Scene (2 min)
Add these GameObjects:
- **WorldGrid** (empty) + WorldGrid component
- **InventoryManager** (empty) + InventoryManager component  
- **TerrainGenerator** (empty) + TerrainGenerator component
- **Main Camera** already has FlyCameraController + BlockPlacer

Link references:
- BlockPlacer → WorldGrid, BlockDatabase, InventoryManager
- TerrainGenerator → WorldGrid, BlockDatabase

### 4. Create Basic UI (1.5 min)
- Create Canvas
- Add Panel (InventoryPanel, start inactive)
- Add child Empty (SlotContainer) with Grid Layout
- Create Image prefab (InventorySlot) with InventorySlotUI component
- Add InventoryUI to Panel, link references

### 5. Play!
- Press Play
- Press R to generate terrain
- Press Tab to open inventory
- Left-click to place, Right-click to break

---

## 🎮 Controls Reference

| Key | Action |
|-----|--------|
| **Tab** | Inventory |
| **R** | Generate terrain |
| **E** | Interact |
| **Click** | Place/Break |
| **WASD** | Move |
| **Space/Q** | Up/Down |
| **Shift** | Fast |
| **Esc** | Unlock cursor |

---

## 🔧 Common Tasks

### Give Player Blocks
```csharp
inventoryManager.AddItem("stone", 64);
inventoryManager.AddItem("wood", 32);
```

### Change World Size
```csharp
// TerrainGenerator Inspector
worldWidth = 200;
worldDepth = 200;
```

### Adjust Physics Speed
```csharp
// FallingBlock
_fallSpeed = 5f;  // Faster falling

// WaterBlock  
_spreadDelay = 0.5f;  // Faster flow
```

---

## 📋 Required Block IDs

Must match exactly in BlockType scriptableObjects:
- bedrock
- stone
- dirt
- grass
- sand (+ FallingBlock component on prefab)
- gravel (+ FallingBlock component on prefab)
- snow
- wood
- leaves
- water (+ WaterBlock component on prefab)
- door (+ DoorBlock component on prefab)

---

## 🐛 Quick Fixes

**Inventory won't open?**
- Check InventoryPanel starts inactive
- Verify all InventoryUI references assigned

**Terrain won't generate?**
- Check block IDs match exactly
- Ensure BlockDatabase has all blocks

**Blocks won't place?**
- Link InventoryManager to BlockPlacer
- Add blocks to inventory first

**Physics not working?**
- Add components to prefabs, not BlockType assets
- Check prefab names match block IDs

---

## 📖 Full Documentation

See `WORLDBUILDER_README.md` for complete setup and API reference.
