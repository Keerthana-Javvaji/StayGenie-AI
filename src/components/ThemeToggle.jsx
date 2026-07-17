import { useEffect, useState } from "react"

export default function ThemeToggle() {

  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  )


  useEffect(() => {

    if (dark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } 
    else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }

  }, [dark])


  return (
    <button
      onClick={() => setDark(!dark)}
      className="
        px-4 py-2 
        rounded-xl
        bg-gray-200 
        dark:bg-gray-700
        text-gray-800
        dark:text-white
        transition
      "
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  )
}