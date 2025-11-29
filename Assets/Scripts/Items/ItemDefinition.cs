using UnityEngine;

namespace BlackRoad.Worldbuilder.Items
{
    /// <summary>
    /// ScriptableObject describing a generic item type.
    /// </summary>
    [CreateAssetMenu(
        fileName = "ItemDefinition",
        menuName = "BlackRoad/Worldbuilder/ItemDefinition",
        order = 0)]
    public class ItemDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string itemId = "item.berry";
        [SerializeField] private string displayName = "Berry";

        [Header("Visual")]
        [SerializeField] private Sprite icon;
        [SerializeField] private Color iconTint = Color.white;

        [Header("Stacking")]
        [SerializeField] private int maxStack = 99;

        [Header("Tags")]
        [Tooltip("True if this item can be used as critter food.")]
        [SerializeField] private bool isFood = false;
        [SerializeField] private float nutritionValue = 0.25f; // how much hunger to reduce

        public string ItemId => itemId;
        public string DisplayName => displayName;
        public Sprite Icon => icon;
        public Color IconTint => iconTint;
        public int MaxStack => maxStack;
        public bool IsFood => isFood;
        public float NutritionValue => nutritionValue;
    }
}
