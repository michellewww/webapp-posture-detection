const Sidebar = ({ showPage }) => (
  <div className="w-44 h-full bg-[#a8c3b5] text-white font-bold flex flex-col justify-center">
    <ul className="space-y-16 w-full">
      <li>
        <button
          onClick={() => showPage('camera')}
          className="block w-full text-center py-2 rounded hover:bg-[#2a6f6f] hover:text-[#fffcf9] transition duration-300"
        >
          Camera
        </button>
      </li>
      <li>
        <button
          onClick={() => showPage('settings')}
          className="block w-full text-center py-2 rounded hover:bg-[#2a6f6f] hover:text-[#fffcf9] transition duration-300"
        >
          Settings
        </button>
      </li>
      <li>
        <button
          onClick={() => showPage('analysis')}
          className="block w-full text-center py-2 rounded hover:bg-[#2a6f6f] hover:text-[#fffcf9] transition duration-300"
        >
          Analysis
        </button>
      </li>
    </ul>
  </div>
);

export default Sidebar;

