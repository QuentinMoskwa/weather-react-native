export function getWeatherIcon(code: number): any {
  // Clear sky
  if (code === 0) {
    return require("@/assets/meteo/sun.png");
  }

  if (code >= 1 && code <= 3) {
    return require("@/assets/meteo/cloudy.png");
  }

  if (code === 45 || code === 48) {
    return require("@/assets/meteo/clouds.png");
  }

  if (code >= 51 && code <= 55) {
    return require("@/assets/meteo/rain.png");
  }

  if (code === 56 || code === 57) {
    return require("@/assets/meteo/rain.png");
  }

  if (code >= 61 && code <= 65) {
    return require("@/assets/meteo/rain.png");
  }

  if (code === 66 || code === 67) {
    return require("@/assets/meteo/rain.png");
  }

  if (code >= 71 && code <= 75) {
    return require("@/assets/meteo/snow.png");
  }

  if (code === 77) {
    return require("@/assets/meteo/snow.png");
  }

  if (code >= 80 && code <= 82) {
    return require("@/assets/meteo/rain.png");
  }

  if (code === 85 || code === 86) {
    return require("@/assets/meteo/snow.png");
  }

  if (code === 95) {
    return require("@/assets/meteo/storm.png");
  }

  if (code === 96 || code === 99) {
    return require("@/assets/meteo/storm.png");
  }

  return require("@/assets/meteo/sun.png");
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return "Ciel dégagé";
  if (code === 1) return "Principalement dégagé";
  if (code === 2) return "Partiellement nuageux";
  if (code === 3) return "Couvert";
  if (code === 45 || code === 48) return "Brouillard";
  if (code >= 51 && code <= 55) return "Bruine";
  if (code === 56 || code === 57) return "Bruine verglaçante";
  if (code >= 61 && code <= 65) return "Pluie";
  if (code === 66 || code === 67) return "Pluie verglaçante";
  if (code >= 71 && code <= 75) return "Chute de neige";
  if (code === 77) return "Grains de neige";
  if (code >= 80 && code <= 82) return "Averses de pluie";
  if (code === 85 || code === 86) return "Averses de neige";
  if (code === 95) return "Orage";
  if (code === 96 || code === 99) return "Orage avec grêle";
  return "Inconnu";
}
