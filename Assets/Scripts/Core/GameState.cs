namespace BlackRoad.Worldbuilder.Core
{
    /// <summary>
    /// Top-level game states used by <see cref="GameManager"/>.
    /// </summary>
    public enum GameState
    {
        /// <summary>Player is on the main-menu screen.</summary>
        MainMenu,

        /// <summary>Player is actively building / exploring the world.</summary>
        Playing,

        /// <summary>Game is paused; input and simulation are frozen.</summary>
        Paused
    }
}
