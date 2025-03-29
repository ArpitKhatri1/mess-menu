"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

function formatDate(dateString?: string) {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd");
}

function returnMenuItems(menu: (string | undefined)[] | undefined): MenuType {
    const breakfast: string[] = [];
    const lunch: string[] = [];
    const dinner: string[] = [];

    if (!menu) return { breakfast, lunch, dinner };

    let prev = "";

    menu.forEach((item) => {
        if (item === "BREAKFAST") prev = "BREAKFAST";
        else if (item === "LUNCH") prev = "LUNCH";
        else if (item === "DINNER") prev = "DINNER";
        else if (item) {
            if (prev === "BREAKFAST") breakfast.push(item);
            else if (prev === "LUNCH") lunch.push(item);
            else if (prev === "DINNER") dinner.push(item);
        }
    });

    return { breakfast, lunch, dinner };
}

const Menupage = () => {
    const availableDays = Array.from({ length: 7 }, (_, i) => {
        const today = new Date();
        today.setDate(today.getDate() + i);
        return {
            day: today.toLocaleString("en-US", { weekday: "long" }).toUpperCase(),
            date: format(today, "yyyy-MM-dd"),
        };
    });

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [formattedDate, setFormattedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [selectedDay, setSelectedDay] = useState<string>(availableDays[0].day);
    const [menu, setMenu] = useState<MenuType>({ breakfast: [], lunch: [], dinner: [] });
    const [apiData, setApiData] = useState<ApiDataType | null>(null);

    const weekDays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    useEffect(() => {
        async function getFileData() {
            try {
                const response = await axios.get("/api/file");
                setApiData(response.data.data);
            } catch (error) {
                console.error("Error fetching menu data:", error);
            }
        }
        getFileData();
    }, []);

    useEffect(() => {
        const foundDay = availableDays.find((day) => day.day === selectedDay);
        if (foundDay) {
            setSelectedDate(new Date(foundDay.date));
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
        <div className="mx-auto h-[calc(100vh)]">
            <div className="flex w-full h-10 text-lg bg-red-400 justify-evenly  rounded cursor-pointer">
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

            <div className="h-full  bg-neutral-700 text-white  rounded">
                <h2 className="text-2xl text-center font-bold py-10">
                    {selectedDay} - {formattedDate}
                </h2>
                <div className="text-xl">

                    {menu && (
                        <div className="space-y-20 gap-10 sm:flex  w-full sm:justify-evenly text-center">
                            {menu.breakfast.length > 0 && (
                                <div className="">
                                    <h3 className="text-2xl font-semibold mb-2">BREAKFAST</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {menu.breakfast.map((item, index) => (
                                            <li key={`breakfast-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {menu.lunch.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-semibold mb-2">LUNCH</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {menu.lunch.map((item, index) => (
                                            <li key={`lunch-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {menu.dinner.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-semibold mb-2">DINNER</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {menu.dinner.map((item, index) => (
                                            <li key={`dinner-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default Menupage;

