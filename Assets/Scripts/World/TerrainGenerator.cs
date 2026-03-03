using UnityEngine;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.World
{
    /// <summary>
    /// Biome types for procedural terrain generation.
    /// </summary>
    public enum BiomeType
    {
        Plains,
        Forest,
        Desert,
        Mountains,
        Snow
    }

    /// <summary>
    /// Procedural terrain generation system with biome support.
    /// Generates layered terrain with trees, height variation, and different biomes.
    /// </summary>
    public class TerrainGenerator : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private WorldGrid worldGrid;
        [SerializeField] private BlockDatabase blockDatabase;

        [Header("World Settings")]
        [SerializeField] private int worldWidth = 100;
        [SerializeField] private int worldDepth = 100;
        [SerializeField] private int seed = 12345;

        [Header("Height Settings")]
        [SerializeField] private float noiseScale = 0.05f;
        [SerializeField] private int heightMultiplier = 10;
        [SerializeField] private int seaLevel = 5;
        [SerializeField] private int maxHeight = 20;

        [Header("Biome Settings")]
        [SerializeField] private float biomeNoiseScale = 0.02f;

        [Header("Layer Settings")]
        [SerializeField] private int bedrockLayer = 1;
        [SerializeField] private int dirtDepth = 3;
        [SerializeField] private int grassDepth = 1;

        [Header("Tree Settings")]
        [SerializeField] private float treeSpawnChance = 0.1f;
        [SerializeField] private int minTreeHeight = 4;
        [SerializeField] private int maxTreeHeight = 6;
        [SerializeField] private int treeLeafRadius = 2;

        [Header("Input")]
        [SerializeField] private KeyCode regenerateKey = KeyCode.R;

        private bool _isGenerating = false;

        private void Start()
        {
            // Find references if not set
            if (worldGrid == null)
                worldGrid = FindObjectOfType<WorldGrid>();
        }

        private void Update()
        {
            // Regenerate with R key
            if (Input.GetKeyDown(regenerateKey) && !_isGenerating)
            {
                RegenerateWithNewSeed();
            }
        }

        /// <summary>
        /// Generates the entire world with current settings.
        /// </summary>
        [ContextMenu("Generate World")]
        public void GenerateWorld()
        {
            if (_isGenerating)
            {
                Debug.LogWarning("[TerrainGenerator] Already generating world.");
                return;
            }

            if (worldGrid == null || blockDatabase == null)
            {
                Debug.LogError("[TerrainGenerator] Missing WorldGrid or BlockDatabase reference.");
                return;
            }

            _isGenerating = true;
            Debug.Log($"[TerrainGenerator] Generating world with seed {seed}...");

            // Generate terrain
            for (int x = 0; x < worldWidth; x++)
            {
                for (int z = 0; z < worldDepth; z++)
                {
                    GenerateColumn(x, z);
                }
            }

            // Generate trees
            GenerateTrees();

            _isGenerating = false;
            Debug.Log("[TerrainGenerator] World generation complete!");
        }

        /// <summary>
        /// Generates a single vertical column of terrain at the given X,Z position.
        /// </summary>
        /// <param name="x">X coordinate</param>
        /// <param name="z">Z coordinate</param>
        private void GenerateColumn(int x, int z)
        {
            // Calculate height using Perlin noise
            float noiseValue = Mathf.PerlinNoise(
                (x + seed) * noiseScale,
                (z + seed) * noiseScale
            );
            int height = Mathf.RoundToInt(noiseValue * heightMultiplier);
            height = Mathf.Clamp(height, 0, maxHeight);

            // Determine biome
            BiomeType biome = GetBiomeAt(x, z);

            // Generate layers
            for (int y = 0; y <= height; y++)
            {
                Vector3Int gridPos = new Vector3Int(x, y, z);
                BlockType blockType = GetBlockTypeForLayer(y, height, biome);

                if (blockType != null)
                {
                    worldGrid.PlaceBlock(gridPos, blockType);
                }
            }
        }

        /// <summary>
        /// Determines the biome type at a given X,Z position using noise.
        /// </summary>
        /// <param name="x">X coordinate</param>
        /// <param name="z">Z coordinate</param>
        /// <returns>The biome type</returns>
        private BiomeType GetBiomeAt(int x, int z)
        {
            float biomeNoise = Mathf.PerlinNoise(
                (x + seed * 2) * biomeNoiseScale,
                (z + seed * 2) * biomeNoiseScale
            );

            if (biomeNoise < 0.2f)
                return BiomeType.Desert;
            else if (biomeNoise < 0.4f)
                return BiomeType.Plains;
            else if (biomeNoise < 0.6f)
                return BiomeType.Forest;
            else if (biomeNoise < 0.8f)
                return BiomeType.Mountains;
            else
                return BiomeType.Snow;
        }

        /// <summary>
        /// Gets the appropriate block type for a specific layer height and biome.
        /// </summary>
        /// <param name="y">Current Y level</param>
        /// <param name="surfaceHeight">Surface height at this column</param>
        /// <param name="biome">Biome type</param>
        /// <returns>Block type to place</returns>
        private BlockType GetBlockTypeForLayer(int y, int surfaceHeight, BiomeType biome)
        {
            // Bedrock layer
            if (y < bedrockLayer)
            {
                return blockDatabase.Get("bedrock");
            }

            // Stone layer (everything except top layers)
            if (y < surfaceHeight - dirtDepth)
            {
                return blockDatabase.Get("stone");
            }

            // Dirt layer
            if (y < surfaceHeight)
            {
                return blockDatabase.Get("dirt");
            }

            // Surface layer (depends on biome)
            if (y == surfaceHeight)
            {
                switch (biome)
                {
                    case BiomeType.Desert:
                        return blockDatabase.Get("sand");
                    case BiomeType.Snow:
                        return blockDatabase.Get("snow");
                    case BiomeType.Plains:
                    case BiomeType.Forest:
                    case BiomeType.Mountains:
                    default:
                        return blockDatabase.Get("grass");
                }
            }

            return null;
        }

        /// <summary>
        /// Generates trees in forest biomes.
        /// </summary>
        private void GenerateTrees()
        {
            BlockType woodBlock = blockDatabase.Get("wood");
            BlockType leavesBlock = blockDatabase.Get("leaves");

            if (woodBlock == null || leavesBlock == null)
            {
                Debug.LogWarning("[TerrainGenerator] Missing wood or leaves block type.");
                return;
            }

            for (int x = 0; x < worldWidth; x++)
            {
                for (int z = 0; z < worldDepth; z++)
                {
                    BiomeType biome = GetBiomeAt(x, z);
                    
                    // Only spawn trees in forest biome
                    if (biome != BiomeType.Forest)
                        continue;

                    // Random chance for tree spawn
                    float random = Random.Range(0f, 1f);
                    if (random > treeSpawnChance)
                        continue;

                    // Find ground level
                    int groundLevel = FindGroundLevel(x, z);
                    if (groundLevel < 0)
                        continue;

                    // Generate tree
                    GenerateTree(x, groundLevel + 1, z, woodBlock, leavesBlock);
                }
            }
        }

        /// <summary>
        /// Finds the ground level (highest solid block) at X,Z position.
        /// </summary>
        /// <param name="x">X coordinate</param>
        /// <param name="z">Z coordinate</param>
        /// <returns>Ground level Y, or -1 if not found</returns>
        private int FindGroundLevel(int x, int z)
        {
            for (int y = maxHeight; y >= 0; y--)
            {
                Vector3Int gridPos = new Vector3Int(x, y, z);
                if (worldGrid.TryGetBlock(gridPos, out GameObject block) && block != null)
                {
                    return y;
                }
            }
            return -1;
        }

        /// <summary>
        /// Generates a single tree at the specified position.
        /// </summary>
        /// <param name="x">X coordinate</param>
        /// <param name="y">Y coordinate (base of trunk)</param>
        /// <param name="z">Z coordinate</param>
        /// <param name="woodBlock">Wood block type</param>
        /// <param name="leavesBlock">Leaves block type</param>
        private void GenerateTree(int x, int y, int z, BlockType woodBlock, BlockType leavesBlock)
        {
            int treeHeight = Random.Range(minTreeHeight, maxTreeHeight + 1);

            // Generate trunk
            for (int i = 0; i < treeHeight; i++)
            {
                Vector3Int trunkPos = new Vector3Int(x, y + i, z);
                worldGrid.PlaceBlock(trunkPos, woodBlock);
            }

            // Generate spherical leaves
            int leafTop = y + treeHeight;
            for (int dx = -treeLeafRadius; dx <= treeLeafRadius; dx++)
            {
                for (int dy = -treeLeafRadius; dy <= treeLeafRadius; dy++)
                {
                    for (int dz = -treeLeafRadius; dz <= treeLeafRadius; dz++)
                    {
                        // Skip if too far from center (create sphere)
                        float distance = Mathf.Sqrt(dx * dx + dy * dy + dz * dz);
                        if (distance > treeLeafRadius)
                            continue;

                        // Don't replace trunk
                        if (dx == 0 && dz == 0 && dy <= 0)
                            continue;

                        Vector3Int leafPos = new Vector3Int(x + dx, leafTop + dy, z + dz);
                        
                        // Only place if empty
                        if (!worldGrid.TryGetBlock(leafPos, out GameObject existing) || existing == null)
                        {
                            worldGrid.PlaceBlock(leafPos, leavesBlock);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Regenerates the world with a new random seed.
        /// </summary>
        [ContextMenu("Regenerate With New Seed")]
        public void RegenerateWithNewSeed()
        {
            // Clear existing world (not implemented in this basic version)
            // In a full implementation, you'd want to remove all blocks first
            
            // Generate new random seed
            seed = Random.Range(0, 999999);
            Debug.Log($"[TerrainGenerator] Regenerating with new seed: {seed}");
            
            GenerateWorld();
        }
    }
}
