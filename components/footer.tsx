import React from "react"

const disclaimers = [
  "CustomTCG.art is a free fan content service not affiliated with, approved by, endorsed by, or produced by Wizards of the Coast, Hasbro, Activision Blizzard, Nuverse, Second Dinner, Marvel, or Konami.",
  "Contact: westgardhnils@gmail.com",
]

export default function Footer() {
  return (
    <footer className="flex flex-wrap justify-start items-start gap-1 pb-4 text-xs opacity-20">
      {disclaimers.map((disclaimer, index) => (
        <small key={index}>{disclaimer}</small>
      ))}
    </footer>
  )
}