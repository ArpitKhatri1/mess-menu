"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { returnMenuItems, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
type ApiDataType = {
  dates: [string, string][];
  columnData: {
    [key: string]: string[];
  }[];
};

type MenuType = {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
};

const Menupage = () => {

  const availableDays = Array.from({ length: 7 }, (_, i) => {
    const today = new Date();
    today.setDate(today.getDate() + i);
    return {
      day: today.toLocaleString("en-US", { weekday: "long" }).toUpperCase(),
      date: format(today, "yyyy-MM-dd"),
    };
  });

  const [formattedDate, setFormattedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedDay, setSelectedDay] = useState<string>(availableDays[0].day);
  const [menu, setMenu] = useState<MenuType>({ breakfast: [], lunch: [], dinner: [] });
  const [apiData, setApiData] = useState<ApiDataType | null>(null);

  const weekDays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  useEffect(() => {
    async function getFileData() {
      try {
        const localStorageMessMenu = localStorage.getItem("mess-menu")
        if (!localStorageMessMenu) {
          const response = await axios.get("/api/file");
          const setAPIResponse: ApiDataType = response.data.data
          setApiData(setAPIResponse);

          localStorage.setItem("mess-menu", JSON.stringify({
            menu: setAPIResponse
          }))
        } else {
          const localStorageDataRes = JSON.parse(localStorage.getItem("mess-menu") as string)
          console.log(localStorageDataRes)
          const localStorageData: ApiDataType = localStorageDataRes.menu
          console.log("local data is")

          console.log(localStorageData)

          const lastDateStr = localStorageData.dates[localStorageData.dates.length - 1][0];
          const dateObj = new Date(lastDateStr);

          // Set time to 11:59 PM
          dateObj.setHours(23);
          dateObj.setMinutes(59);
          dateObj.setSeconds(59);

          const currDate = new Date()

          if (dateObj.getTime() < currDate.getTime()) {
            // fetch new Data
            const response = await axios.get("/api/file");
            const setAPIResponse: ApiDataType = response.data.data
            setApiData(setAPIResponse);

            localStorage.setItem("mess-menu", JSON.stringify({
              menu: setAPIResponse
            }))
          } else {
            setApiData(localStorageData)
          }

        }

      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    }
    getFileData();
  }, []);

  useEffect(() => {
    const foundDay = availableDays.find((day) => day.day === selectedDay);
    if (foundDay) {

      setFormattedDate(foundDay.date);
    }

    if (apiData) {
      const filteredMenuItems = apiData.columnData
        .map((entry) => {
          const key = Object.keys(entry)[0];
          if (entry[key][0] === selectedDay && formatDate(key) === foundDay?.date) {
            return entry[key].slice(1);
          }
          return [];
        })
        .flat();

      setMenu(returnMenuItems(filteredMenuItems));
    }
  }, [apiData, selectedDay]);

  return (

    <div className="mx-auto ">

      <div className="z-50 flex fixed bottom-0 mt-20 w-full h-10 text-lg bg-red-400 justify-evenly  rounded cursor-pointer">
        {weekDays.map((day) => (
          <div
            key={day}
            className={cn("px-4 py-1 transition-all", day === selectedDay ? "font-bold bg-red-500" : "")}
            onClick={() => setSelectedDay(day)}
          >
            {day.substring(0, 2)}
          </div>
        ))}
      </div>

      <div className="h-full rounded pb-32">
        <h2 className="text-2xl text-center font-bold py-10 bg-emerald-300 mb-16">
          {selectedDay} - {formattedDate}
        </h2>
        <div className="text-xl">

          {apiData ? (
            menu ? (
              <div className="space-y-20 flex flex-col md:flex-row w-full text-center">
                {menu.breakfast.length > 0 && (
                  <div className=" h-fit md:min-h-[400px] bg-neutral-200 mx-auto rounded-xl w-[300px]">
                    <h3 className="text-2xl font-semibold mb-2 bg-orange-500 px-20 py-5 rounded-t-xl">
                      BREAKFAST
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 pb-5 mt-5">
                      {menu.breakfast.map((item, index) => (
                        <li key={`breakfast-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {menu.lunch.length > 0 && (
                  <div className="h-fit md:min-h-[400px] bg-neutral-200 mx-auto rounded-xl w-[300px]">
                    <h3 className="relative text-2xl flex justify-center font-semibold mb-2 bg-yellow-500 px-20 py-5 rounded-t-xl">
                      LUNCH
                      <Link href="/menu">
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-500 text-yellow-500  rounded">
                          he
                        </div>
                      </Link>
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 pb-5 mt-5">
                      {menu.lunch.map((item, index) => (
                        <li key={`lunch-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {menu.dinner.length > 0 && (
                  <div className="h-fit md:min-h-[400px] bg-neutral-200 mx-auto rounded-xl w-[300px]">
                    <h3 className="text-2xl font-semibold mb-2 bg-blue-500 px-20 py-5 rounded-t-xl">
                      DINNER
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 pb-5 mt-5">
                      {menu.dinner.map((item, index) => (
                        <li key={`dinner-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {menu.breakfast.length === 0 && menu.lunch.length === 0 && menu.dinner.length === 0 && (
                  <div className="w-fit mx-auto font-bold">
                    Menu will be updated shortly
                  </div>
                )}
              </div>
            ) : (
              <div>Menu not available</div>
            )
          ) : (
            <div className="w-fit mx-auto font-bold">Loading...</div>
          )}

        </div>

      </div>
    </div >
  );
};

export default Menupage;

