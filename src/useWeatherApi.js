import { useState, useEffect, useCallback } from 'react';

const fetchWeatherForecast = (cityName) => {
    return fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-0383FBAE-6EF6-4F69-B6FD-F830A6E3686E&locationName=${cityName}`
    )
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {}
        );
  
        return {
          // 因有Call二次, 更新同一State, 所以要先傳入之前的State, 解構後, 再合併新的
          // 新的若Key 和先前的State相同Key, 則新的會盖掉之前的
          // ...prevState,
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
  };
  
const fetchCurrentWeather = (locationName) => {
    return fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-0383FBAE-6EF6-4F69-B6FD-F830A6E3686E&locationName=${locationName}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {}
        );
        return {
          // 因有Call二次, 更新同一State, 所以要先傳入之前的State, 解構後, 再合併新的
          // 新的若Key 和先前的State相同Key, 則新的會盖掉之前的
          // ...prevState,
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          description: '多雲時晴',
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        };
  
    });
};

const useWeatherApi = (currentLocation) => {
    const { locationName, cityName } = currentLocation;

    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        humid: 0,
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
        isLoading: true,
    });
    
    const fetchData = useCallback(() => {
        const fetchingData = async () => {
          const [currenWeather, weatherForcast] = await Promise.all([
                fetchCurrentWeather(locationName),
                fetchWeatherForecast(cityName),
          ]);
    
          setWeatherElement({
              ...currenWeather,
              ...weatherForcast,
              isLoading: false,
          });
        };
    
        setWeatherElement((prevState) => ({
          ...prevState,
          isLoading: true,
        }));
    
        fetchingData();
    }, [locationName, cityName]);
    
    useEffect(() => {
        console.log('execute function in useEffect');
        fetchData();
    },[fetchData]);

    return [weatherElement, fetchData];
};

export default useWeatherApi;