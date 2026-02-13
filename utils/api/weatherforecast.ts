import { fetchWeatherApi } from "openmeteo";

export type WeatherData = {
  hourly: {
    time: Date[];
    temperature_2m: Float32Array | null;
    weather_code: Float32Array | null;
  };
  daily?: {
    time: Date[];
    weather_code: Float32Array;
    temperature_2m_max: Float32Array;
    temperature_2m_min: Float32Array;
  };
};

export type WeatherParams = {
  latitude: number;
  longitude: number;
  daily?: string[];
  hourly?: string[];
  bounding_box?: string;
};

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
): Promise<WeatherData | null> {
  const params: WeatherParams = {
    latitude,
    longitude,
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"],
    hourly: ["temperature_2m", "apparent_temperature", "weather_code"],
  };

  const url = "https://api.open-meteo.com/v1/forecast";

  try {
    const responses = await fetchWeatherApi(url, params);

    if (!responses || responses.length === 0) {
      console.log("pas de reponse api");
      return null;
    }

    const response = responses[0];
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const hourly = response.hourly();
    const daily = response.daily();

    if (!hourly) {
      console.log("meteo du jour non trouvée.");
      return null;
    }

    const weatherData: WeatherData = {
      hourly: {
        time: Array.from(
          {
            length:
              (Number(hourly.timeEnd()) - Number(hourly.time())) /
              hourly.interval(),
          },
          (_, i) =>
            new Date(
              (Number(hourly.time()) +
                i * hourly.interval() +
                utcOffsetSeconds) *
                1000,
            ),
        ),
        temperature_2m: hourly.variables(0)?.valuesArray() || null,
        weather_code: hourly.variables(2)?.valuesArray() || null,
      },
      ...(daily && {
        daily: {
          time: Array.from(
            {
              length:
                (Number(daily.timeEnd()) - Number(daily.time())) /
                daily.interval(),
            },
            (_, i) =>
              new Date(
                (Number(daily.time()) +
                  i * daily.interval() +
                  utcOffsetSeconds) *
                  1000,
              ),
          ),
          weather_code: daily.variables(0)!.valuesArray() || new Float32Array(),
          temperature_2m_max: daily.variables(1)!.valuesArray() || new Float32Array(),
          temperature_2m_min: daily.variables(2)!.valuesArray() || new Float32Array(),
        },
      }),
    };
    console.log(`[${new Date().toLocaleString()}] new request :`, weatherData);

    return weatherData;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);

    if (
      errorMessage.includes("JSON Parse error") ||
      errorMessage.includes("Unexpected character") ||
      errorMessage.includes("<")
    ) {
      console.warn(
        "API returned HTML error instead of JSON. Server may be overloaded or down.",
      );
      return null;
    }

    const is504 =
      errorMessage.includes("504") ||
      errorMessage.includes("Gateway") ||
      errorMessage.includes("timeout");

    if (is504) {
      console.warn(
        "API Gateway Timeout (504) - Not retrying. Server is overloaded.",
      );
      return null;
    }

    const isNetworkError =
      errorMessage.includes("Network") ||
      errorMessage.includes("Failed") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ETIMEDOUT");

    if (isNetworkError) {
      console.warn("Network error detected. Returning null gracefully.");
      return null;
    }

    console.error("Error fetching weather data:", error);
    return null;
  }
}
