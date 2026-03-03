# Unity Worldbuilder Game Architecture - Implementation Guide

## Overview
This guide documents the complete game architecture implementation for the Unity worldbuilder sandbox prototype.

## Architecture Components

### 1. Core Systems

#### GameState.cs
```
Enum with three states:
- MainMenu: Initial state, main menu displayed
- Playing: Active gameplay, all controls enabled
- Paused: Frozen gameplay, pause menu displayed
```

#### GameManager.cs
```
Singleton manager controlling:
- State transitions (SetState, Pause, Resume, ReturnToMainMenu, StartNewGame)
- ESC key handling (toggles pause/unpause)
- Time.timeScale management (0 when paused, 1 when playing)
- Cursor lock state (locked in Playing, unlocked in MainMenu/Paused)
- Enable/disable gameplay controls per state
```

#### WorldSerializer.cs
```
Save/Load system:
- F5: Save world to JSON (grid positions + block IDs)
- F9: Load world from JSON
- Location: Application.persistentDataPath/WorldSaves/
- Automatic directory creation
- Clear world before loading
- Preserve cell size
```

### 2. World/Building Systems

#### BlockType.cs
```
ScriptableObject with:
- blockId: Unique identifier
- displayName: UI display name
- category: BlockCategory enum (Terrain/Structure/Decorative)
- prefab: 3D mesh to instantiate
- hardness: Break time in seconds (0-10, 0 = instant)
- icon: Sprite for UI display
- gizmoColor: Debug visualization color
```

#### BlockDatabase.cs
```
ScriptableObject registry with:
- blocks: Array of BlockType
- Get(id): Lookup by ID
- GetDefault(): First block
- GetByCategory(category): Filter by category
- GetAtIndex(index): Access by hotbar slot (0-8)
- GetAll(): All blocks
- Count: Total block count
```

#### WorldGrid.cs
```
Grid-based block storage:
- WorldToGrid(worldPos): Convert world to grid coordinates
- GridToWorld(gridPos): Convert grid to world coordinates
- PlaceBlock(gridPos, blockType): Instantiate block
- RemoveBlock(gridPos): Destroy block
- GetAllBlocks(): Get all blocks (for saving)
- ClearAll(): Remove all blocks (for loading)
- BlockCount: Total placed blocks
```

#### BlockPlacer.cs
```
Raycast-based placement:
- Left click: Instant block placement
- Hold right click: Break block (progress based on hardness)
- 1-9 keys: Direct block selection
- Scroll wheel: Cycle through blocks
- CurrentBlock: Currently selected block type
- BreakProgress: Current break progress (0-1)
```

### 3. Player Systems

#### PlayerController.cs
```
First-person controller:
- Fly mode: WASD + Space/Ctrl for vertical movement
- Grounded mode: WASD + jump/gravity
- G key: Toggle between modes
- Mouse look with pitch clamping
- Speed modifiers (walk, run, fly)
- IsFlying: Current mode property
```

### 4. UI Systems

#### BlockSelectionBar.cs
```
Hotbar UI:
- Display 9 block slots (or fewer if database has less)
- Show block icons or color fallback
- Highlight selected slot
- Auto-update when block placer selection changes
- Dynamic slot creation from prefab or generated
```

#### MainMenuUI.cs
```
Main menu interface:
- New World: Clear grid and start playing
- Load World: Load save and start playing
- Quit: Exit application (Editor: stop playmode)
- Show/Hide methods
```

#### PauseMenuUI.cs
```
Pause menu interface:
- Resume: Return to Playing state
- Save: Trigger world save (F5 equivalent)
- Load: Load world and resume
- Main Menu: Return to MainMenu state
- Show/Hide methods
```

#### PlayerHUD.cs
```
In-game HUD:
- Display current block name
- Display current block icon (or color)
- Show movement mode (FLY MODE / GROUNDED)
- Real-time updates
- Show/Hide methods
```

## Input Reference

| Key/Input | Function | Script |
|-----------|----------|--------|
| ESC | Pause/unpause | GameManager |
| F5 | Save world | WorldSerializer |
| F9 | Load world | WorldSerializer |
| G | Toggle fly/grounded | PlayerController |
| 1-9 | Select block 1-9 | BlockPlacer |
| Scroll Wheel | Cycle blocks | BlockPlacer |
| Left Click | Place block | BlockPlacer |
| Hold Right Click | Break block | BlockPlacer |
| WASD | Move player | PlayerController |
| Mouse | Look around | PlayerController |
| Space | Jump (grounded) / Up (fly) | PlayerController |
| Left Shift | Run | PlayerController |
| Left Ctrl | Down (fly) | PlayerController |

## State Flow

```
MainMenu State
   ↓ (New World / Load World)
Playing State
   ↓ (ESC)
Paused State
   ↓ (ESC / Resume)
Playing State
   ↓ (Main Menu button)
MainMenu State
```

## Save File Format

```json
{
  "blocks": [
    {
      "blockId": "block.dirt",
      "gridX": 0,
      "gridY": 0,
      "gridZ": 0
    },
    ...
  ],
  "cellSize": 1.0
}
```

## Unity Inspector Configuration

### GameManager
- Assign BlockDatabase asset
- Assign BlockPlacer component
- Assign FlyCameraController component (if using)
- Assign PlayerController component
- Assign PauseMenuUI component
- Assign MainMenuUI component

### WorldSerializer
- Assign WorldGrid component
- Assign BlockDatabase asset
- Set slotName (default: "slot1")
- Configure save/load keys (default: F5/F9)

### BlockPlacer
- Assign WorldGrid component
- Assign BlockDatabase asset
- Set maxDistance (default: 50)
- Configure placementMask

### BlockSelectionBar
- Assign BlockDatabase asset
- Assign BlockPlacer component
- Assign slotPrefab (optional)
- Assign slotsContainer (Transform)

### PlayerHUD
- Assign BlockPlacer component
- Assign PlayerController component
- Assign UI Text/Image elements

## Creating Block Types

1. Right-click in Project → Create → BlackRoad/Worldbuilder/BlockType
2. Set properties:
   - blockId: Unique string ID (e.g., "block.stone")
   - displayName: Human-readable name
   - category: Terrain, Structure, or Decorative
   - prefab: 3D model GameObject
   - hardness: 0-10 seconds (0 = instant break)
   - icon: UI sprite (optional)
   - gizmoColor: Debug color

3. Add to BlockDatabase:
   - Right-click in Project → Create → BlackRoad/Worldbuilder/BlockDatabase
   - Drag BlockType assets into blocks array
   - First 9 blocks appear in hotbar

## Testing Checklist

- [ ] Start in MainMenu state
- [ ] Click New World → transitions to Playing
- [ ] ESC → pauses game (Time.timeScale = 0, cursor visible)
- [ ] ESC again → resumes game
- [ ] Press 1-9 keys → selects different blocks
- [ ] Scroll wheel → cycles through blocks
- [ ] Left click → places block instantly
- [ ] Right click → breaks block (progress based on hardness)
- [ ] G key → toggles fly/grounded mode
- [ ] Place blocks → Press F5 → saves world
- [ ] Clear blocks → Press F9 → loads world back
- [ ] Pause menu buttons work correctly
- [ ] Main menu buttons work correctly
- [ ] HUD shows current block and mode

## Extension Points

### Add New Block Category
1. Edit BlockType.cs → Add to BlockCategory enum
2. Update BlockSelectionBar logic if filtering by category

### Add More Hotbar Slots
1. BlockPlacer: Change number key handling (add 0, etc.)
2. BlockSelectionBar: Increase maxSlots

### Add Block Breaking Visual Feedback
1. BlockPlacer: Use BreakProgress property
2. Create crack texture overlay
3. Update overlay alpha based on progress

### Add Multiple Save Slots
1. MainMenuUI/PauseMenuUI: Add slot selection UI
2. WorldSerializer: Pass slot parameter from UI buttons

### Store BlockType Reference on Blocks
1. Create component: BlockInstance.cs
2. Add BlockType field
3. Assign in WorldGrid.PlaceBlock()
4. Read in BlockPlacer for accurate hardness

## Troubleshooting

**Blocks don't place:**
- Check WorldGrid is assigned in BlockPlacer
- Verify BlockDatabase has blocks
- Check placement layer mask includes terrain

**Save/Load doesn't work:**
- Verify WorldSerializer has WorldGrid and BlockDatabase
- Check console for error messages
- Verify Application.persistentDataPath is writable

**Hotbar doesn't show blocks:**
- Check BlockDatabase has blocks
- Verify BlockSelectionBar has slotsContainer
- Check BlockPlacer reference

**Pause doesn't work:**
- Verify GameManager has PauseMenuUI reference
- Check ESC key input in GameManager.Update()
- Verify Time.timeScale changes

**Breaking too fast/slow:**
- Adjust hardness value on BlockType (0-10 seconds)
- Check BlockPlacer.HandleBreaking() logic

## Performance Considerations

- WorldGrid uses Dictionary for O(1) block lookup
- BlockDatabase builds index on enable for fast ID lookup
- UI updates only when selection changes
- Save/Load uses Unity's JsonUtility (efficient)

## License & Credits

Part of BlackRoad OS - Unity Worldbuilder Game
All scripts use namespace: BlackRoad.Worldbuilder.*

