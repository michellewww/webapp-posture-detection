const Sidebar = ({ showPage }) => (
  <div className="bg-[#F8F6F7] flex items-center">
    <div className="ml-4 w-44 h-[95%] bg-[#a8c3b5] text-white font-bold text-xl flex flex-col justify-center rounded-2xl">
      <ul className="space-y-16 w-full">
        <li>
          <button
            onClick={() => showPage('camera')}
            className="block w-full text-center py-2 rounded hover:bg-[#608a75] hover:text-[#fffcf9] transition duration-300"
          >
            Camera
          </button>
        </li>
        <li>
          <button
            onClick={() => showPage('settings')}
            className="block w-full text-center py-2 rounded hover:bg-[#608a75] hover:text-[#fffcf9] transition duration-300"
          >
            Settings
          </button>
        </li>
        <li>
          <button
            onClick={() => showPage('analysis')}
            className="block w-full text-center py-2 rounded hover:bg-[#608a75] hover:text-[#fffcf9] transition duration-300"
          >
            Analysis
          </button>
        </li>
      </ul>
    </div>
  </div>
);

export default Sidebar;

