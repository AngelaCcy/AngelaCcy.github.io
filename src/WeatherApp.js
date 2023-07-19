// import React from 'react';
// import './normalize.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import sunriseAndSunsetData from './sunrise-sunset.json';
import WeatherCard from './WeatherCard';
import useWeatherApi from './useWeatherApi';
import WeatherSetting from './WeatherSetting';
import { findLocation } from './utils';
// CSS-in-js 的寫法
// STEP 1：載入 emotion 的 styled 套件
import styled from '@emotion/styled';
import { ThemeProvider } from 'emotion-theming';

const Container = styled.div`
  background-color: ${(props) => props.backgroundColor};
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};



const getMoment = (locationName) => {
  // STEP 2：從日出日落時間中找出符合的地區
  const location = sunriseAndSunsetData.find((data) => data.locationName === locationName);
  // STEP 3：找不到的話則回傳 null
  if (!location) return null;

  // STEP 4：取得當前時間
  const now = new Date();
  console.log(now);

  // STEP 5：將當前時間以 "2019-10-08" 的時間格式呈現 2019\10\08
  const nowDate = Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .replace(/\//g, '-');

  // STEP 6：從該地區中找到對應的日期
  const locationDate =
    location.time && location.time.find((time) => time.dataTime === nowDate);

  // STEP 7：將日出日落以及當前時間轉成時間戳記（TimeStamp）
  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`).getTime();
  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`).getTime();
  const nowTimeStamp = now.getTime();

  // STEP 8：若當前時間介於日出和日落中間，則表示為白天，否則為晚上
  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? 'day' : 'night';
}



const WeatherApp = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState('WeatherCard');
  const storageCity = localStorage.getItem('cityName');
  const [currentCity, setCurrentCity] = useState(storageCity ||'臺北市');
  const currentLocation = findLocation(currentCity) || {};

  const [weatherElement, fetchData] = useWeatherApi(currentLocation);
  const moment = useMemo(() => getMoment(currentLocation.sunriseCityName), [
    currentLocation.sunriseCityName,
  ]);

  // 根據 moment 決定要使用亮色或暗色主題
  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark');
    // 記得把 moment 放入 dependencies 中
  }, [moment]);

  useEffect(() => {
    localStorage.setItem('cityName', currentCity);
  }, [currentCity]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {/* 如果找不到false就回傳最後一個 */}
        {currentPage === 'WeatherCard' && (
          <WeatherCard
            cityName={currentLocation.cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'WeatherSetting' && <WeatherSetting cityName={currentLocation.cityName} setCurrentCity={setCurrentCity} setCurrentPage={setCurrentPage} />}
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;