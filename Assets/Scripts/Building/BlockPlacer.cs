using UnityEngine;
using BlackRoad.Worldbuilder.World;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// Handles block placement and removal with raycasting.
    /// Integrates with inventory system and supports interactive blocks.
    /// </summary>
    [RequireComponent(typeof(Camera))]
    public class BlockPlacer : MonoBehaviour
    {
        [Header("Refs")]
        public WorldGrid worldGrid;
        public BlockDatabase blockDatabase;
        
        [Header("Inventory")]
        [SerializeField] private Inventory.InventoryManager _inventoryManager;

        [Header("Placement")]
        public float maxDistance = 50f;
        public LayerMask placementMask = ~0;

        [Header("Input")]
        [SerializeField] private KeyCode interactKey = KeyCode.E;

        private Camera _camera;
        private BlockType _currentBlock;

        private void Awake()
        {
            _camera = GetComponent<Camera>();
        }

        private void Start()
        {
            if (blockDatabase != null)
            {
                _currentBlock = blockDatabase.GetDefault();
            }

            if (worldGrid == null)
            {
                // Try to find one in the scene
                worldGrid = FindObjectOfType<WorldGrid>();
            }

            if (_inventoryManager == null)
            {
                // Try to find one in the scene
                _inventoryManager = FindObjectOfType<Inventory.InventoryManager>();
            }
        }

        private void Update()
        {
            if (_camera == null || worldGrid == null || _currentBlock == null)
                return;

            Ray ray = _camera.ScreenPointToRay(UnityEngine.Input.mousePosition);

            if (Physics.Raycast(ray, out RaycastHit hit, maxDistance, placementMask))
            {
                // Place with left click
                if (UnityEngine.Input.GetMouseButtonDown(0))
                {
                    HandlePlacement(hit);
                }

                // Remove with right click
                if (UnityEngine.Input.GetMouseButtonDown(1))
                {
                    HandleRemoval(hit);
                }

                // Interact with E key
                if (UnityEngine.Input.GetKeyDown(interactKey))
                {
                    HandleInteraction(hit);
                }
            }
        }

        /// <summary>
        /// Handles block placement with inventory integration.
        /// </summary>
        private void HandlePlacement(RaycastHit hit)
        {
            // Check inventory
            if (_inventoryManager != null && !_inventoryManager.HasItem(_currentBlock.blockId, 1))
            {
                Debug.Log($"[BlockPlacer] Not enough {_currentBlock.displayName} in inventory.");
                return; // Not enough blocks in inventory
            }

            Vector3Int gridPos = worldGrid.WorldToGrid(hit.point + hit.normal * 0.5f);
            GameObject placed = worldGrid.PlaceBlock(gridPos, _currentBlock);

            // Remove from inventory if placement succeeded
            if (placed != null && _inventoryManager != null)
            {
                _inventoryManager.RemoveItem(_currentBlock.blockId, 1);
            }
        }

        /// <summary>
        /// Handles block removal with inventory integration.
        /// </summary>
        private void HandleRemoval(RaycastHit hit)
        {
            Vector3Int gridPos = worldGrid.WorldToGrid(hit.point - hit.normal * 0.5f);
            
            // Get the block type before removing
            BlockType blockType = null;
            if (worldGrid.TryGetBlock(gridPos, out GameObject blockObj) && blockObj != null)
            {
                // Try to get block type from the object name or tag
                // This is a simplified approach - in production you might store the type differently
                string blockName = blockObj.name.Replace("(Clone)", "").Trim();
                if (blockDatabase != null)
                {
                    // Try to find matching block type
                    foreach (var bt in blockDatabase.blocks)
                    {
                        if (bt != null && bt.prefab != null)
                        {
                            string prefabName = bt.prefab.name;
                            if (blockName.Contains(prefabName) || prefabName.Contains(blockName))
                            {
                                blockType = bt;
                                break;
                            }
                        }
                    }
                }
            }

            // Remove the block
            bool removed = worldGrid.RemoveBlock(gridPos);

            // Add to inventory if removal succeeded
            if (removed && _inventoryManager != null && blockType != null)
            {
                _inventoryManager.AddItem(blockType.blockId, 1);
            }
        }

        /// <summary>
        /// Handles interaction with interactive blocks (doors, etc).
        /// </summary>
        private void HandleInteraction(RaycastHit hit)
        {
            Vector3Int gridPos = worldGrid.WorldToGrid(hit.point - hit.normal * 0.5f);
            
            if (worldGrid.TryGetBlock(gridPos, out GameObject blockObj) && blockObj != null)
            {
                // Check for door block
                var door = blockObj.GetComponent<DoorBlock>();
                if (door != null)
                {
                    door.OnInteract();
                    return;
                }

                // Can add more interactive block types here
            }
        }

        /// <summary>
        /// Sets the current block type to place.
        /// </summary>
        public void SetCurrentBlock(BlockType blockType)
        {
            if (blockType != null)
            {
                _currentBlock = blockType;
            }
        }

        /// <summary>
        /// Gets the current block type being placed.
        /// </summary>
        public BlockType GetCurrentBlock()
        {
            return _currentBlock;
        }
    }
}
