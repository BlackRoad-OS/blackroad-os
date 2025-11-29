using UnityEngine;

namespace BlackRoad.Worldbuilder.Economy
{
    /// <summary>
    /// Simple currency holder for the player.
    /// </summary>
    public class PlayerWallet : MonoBehaviour
    {
        [SerializeField] private int startingCoins = 0;

        public int Coins { get; private set; }

        private void Awake()
        {
            Coins = startingCoins;
        }

        public bool CanAfford(int amount)
        {
            return amount >= 0 && Coins >= amount;
        }

        public bool TrySpend(int amount)
        {
            if (!CanAfford(amount)) return false;
            Coins -= amount;
            return true;
        }

        public void AddCoins(int amount)
        {
            if (amount > 0)
                Coins += amount;
        }
    }
}
