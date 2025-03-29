//@ts-ignore
"use client"

import axios from "axios";
import { ChangeEvent, useState } from "react";
import * as XLSX from 'xlsx';
export default function Home() {
  function isAlpha(str: string): boolean {
    return /^[A-Za-z]+$/.test(str);
  }
  function checkIfValidData(data: string): boolean {
    const dataArray = data.split('')
    let valid = false;
    dataArray.forEach((letter) => {
      if (isAlpha(letter)) {
        valid = true;
        return valid;
      }
    })
    return valid
  }

  const [sfile, setFile] = useState<File | null>()
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file)
    } else {
      return
    }
    const parseFile = async () => {
      const arrBuffer = await file.arrayBuffer()
      const workbooks = XLSX.read(arrBuffer)
      const firstSheet = workbooks.Sheets[workbooks.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false })
      // console.log(jsonData) // returns an array of objects each with key as data

      // console.log(jsonData[0]) // returns an object container all dates as key and Weeks 
      const allDates = jsonData[0]
      const keyArrays = Object.keys(allDates as Object) // returns an array of date

      const coloumArray: any = []
      keyArrays.forEach((key) => {
        const tempArray: any = {
          [key]: []
        };
        let ignoreWord = "" // ignore the friday in the data set

        if (checkIfValidData(key)) {
          jsonData.forEach((dataPoint: any, index) => {
            const ignoring = index == 0 ? dataPoint[key] : ""
            if (ignoring !== "") {
              ignoreWord = ignoring
            }

            const data = dataPoint[key]

            if (!data || data === ignoreWord || !checkIfValidData(data)) {

            } else {
              tempArray[key].push(data)
            }
          })

        }
        tempArray[key].splice(0, 0, ignoreWord)

        coloumArray.push(tempArray)

      })
      console.log(coloumArray)

      const finalDays = coloumArray.map((list: any) => {
        const key = Object.keys(list)[0];
        return [key, list[key][0]];
      });
      console.log(finalDays)
      // console.log(finalData)

      const fileWriteJson = {
        dates: finalDays,
        columnData: coloumArray
      }

      const res = await axios.post("/api/file", fileWriteJson)
      const data = await res.data
      console.log(data)

    }
    parseFile()

    // written into the file is of obejct {dates:allDates,coloumWiseData:coloumArray}

  }
  return (
    <div className="bg-neutral-500 text-white h-full">
      <input onChange={handleFileUpload} type="file" />

    </div>

  );
}

