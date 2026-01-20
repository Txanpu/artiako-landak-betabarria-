
import { GameState, WeatherType } from '../types';

export const tickWorld = (state: GameState): Partial<GameState> => {
    // Every 5 turns, toggle Day/Night
    const isNight = Math.floor(state.turnCount / 5) % 2 === 1;
    
    // Weather Logic
    let weather: WeatherType = state.world.weather;
    let forecast = [...(state.world.forecast || [])];
    
    // Ensure forecast has items (fallback)
    if (forecast.length === 0) forecast = ['sunny', 'rain', 'sunny'];

    // Change weather with probability (10%) OR if weather is strictly forced by event
    let weatherChanged = false;
    if (Math.random() < 0.10) {
        // Take next weather from forecast
        const nextWeather = forecast.shift();
        if (nextWeather) {
            weather = nextWeather;
            weatherChanged = true;
            
            // Add new random weather to end of forecast to keep queue full
            const roll = Math.random();
            let newFuture: WeatherType = 'sunny';
            if (roll < 0.6) newFuture = 'sunny';
            else if (roll < 0.9) newFuture = 'rain';
            else newFuture = 'heatwave';
            
            forecast.push(newFuture);
        }
    }

    const prevNight = state.world.isNight;
    const logs: string[] = [];

    if (isNight && !prevNight) logs.push('🌙 Cae la NOCHE en Artia. El crimen sube, las Utilidades bajan.');
    if (!isNight && prevNight) logs.push('☀️ Amanece en Artia.');
    
    if (weatherChanged) {
        if (weather === 'rain') logs.push('🌧️ Empieza a llover (Movimiento -1).');
        if (weather === 'heatwave') logs.push('🔥 ¡OLA DE CALOR! Nadie paga alquiler en las calles.');
        if (weather === 'sunny' && state.world.weather === 'rain') logs.push('🌤️ Escampa. Sale el sol.');
    }

    return {
        world: {
            isNight,
            weather,
            dayCount: state.world.dayCount + (isNight && !prevNight ? 1 : 0),
            forecast
        },
        logs: [...logs, ...state.logs] // Prepend new logs
    };
};
