'use client';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers'; // Import ethers
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';
import LoginButton from '../../../components/LoginButton';
import SignupButton from '../../../components/SignupButton';
import abi from './abi.json'; // Import ABI from the JSON file
import '../.././global.css';
import { getBasename, type Basename } from '../../../basenames';
import { getEnsName } from '../../../ensnames';
import { truncateWalletAddress } from '../../../utils'; // Assuming you have this utility function

// Import your animations
import Animation1 from './animations/animation1.json';
import Animation2 from './animations/animation2.json';
import Animation3 from './animations/animation3.json';
import Animation4 from './animations/animation4.json';
import Animation5 from './animations/animation5.json';
import Animation6 from './animations/animation6.json';
import Animation7 from './animations/animation7.json';
import BottomMenu from './animations/bottom-menu.json'; // NEW: Import bottom-menu animation

import DashboardAnimation from './animations/dashboard.json';
import LeaderboardAnimation from './animations/leaderboard.json';

// Define constants
const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;
const CONTRACT_ADDRESS = '0xfe3Fc6cb04bA5958b0577a0c6528269964e7C8bF'; // Your contract address

export default function Page() {
  const { address } = useAccount();

  // Array of animations in order
  const animations = [Animation1, Animation2, Animation3, Animation4, Animation5, Animation6, Animation7];

  // Array indicating whether each animation should loop
  const animationLoopSettings = [false, false, false, false, false, false, false];

  // State to manage current animation index
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState<number>(0);

  // State to trigger animation playback
  const [animationData, setAnimationData] = useState<any>(null);

  // State to track if animation has played
  const [animationPlayed, setAnimationPlayed] = useState<boolean>(false);

  // State to manage visibility of Prev and Next buttons
  const [showButtons, setShowButtons] = useState<boolean>(false);

  // State to manage visibility of the vote_button
  const [voteButtonVisible, setVoteButtonVisible] = useState<boolean>(true);

  // State to manage drawer states
  const [drawerState, setDrawerState] = useState<'closed' | 'primary-open' | 'secondary-open'>('closed');

  // State to store balances
  const [balances, setBalances] = useState<{ address: string; balance: number }[]>([]);

  const [userBalance, setUserBalance] = useState<number | null>(null);

  // State to store community pool balance
  const [communityPoolBalance, setCommunityPoolBalance] = useState<string>('');

  // State to handle errors
  const [error, setError] = useState<string | null>(null);

  // State to handle loading
  const [loading, setLoading] = useState<boolean>(false);

  // New state variable to store the top basename
  const [topBasename, setTopBasename] = useState<Basename | null>(null);

  const [top10, setTop10] = useState<{ address: string; balance: number }[]>([]);

  // New state variable for top 10 users' information
  const [top10UserInfos, setTop10UserInfos] = useState<
    { place: string; userInfo: string; balanceInfo: string }[]
  >([]);

  // NEW: State variable to prevent multiple rapid clicks (if needed)
  const [isPrevProcessing, setIsPrevProcessing] = useState(false);

  // NEW: State variable to track if the user has seen the last animation (resets on refresh)
  const [hasSeenLastAnimation, setHasSeenLastAnimation] = useState(false);

  // NEW: Ref for the main Lottie instance to control play/pause
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  // NEW: State to control whether the animation is paused
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  // Initialize ethers provider and contract
  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  // Fetch all Assigned events to get unique user addresses
  const fetchAllAddresses = async () => {
    try {
      const filter = contract.filters.Assigned();
      const events = await contract.queryFilter(filter, 0, 'latest');

      const addressesSet = new Set<string>();
      events.forEach((event) => {
        if (event.args) {
          const userAddress = event.args.user;
          if (userAddress.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
            addressesSet.add(userAddress);
          }
        }
      });

      return Array.from(addressesSet);
    } catch (err) {
      console.error('Error fetching Assigned events:', err);
      throw err;
    }
  };

  // Fetch balance for a single address
  const fetchBalance = async (userAddress: string) => {
    try {
      const balance = await contract.getCommunityUSDC(userAddress);
      const balanceInCents = balance.div(ethers.BigNumber.from(10000));
      return balanceInCents.toNumber();
    } catch (err) {
      console.error(`Error fetching balance for ${userAddress}:`, err);
      return '--';
    }
  };

  // Fetch Community Pool Balance
  const fetchCommunityPoolBalance = async () => {
    try {
      const poolBalance = await contract.unassignedPoolBalance();
      const formattedBalance = (poolBalance.toNumber() / 1000000).toFixed(0);
      return `$${formattedBalance}`;
    } catch (err) {
      console.error('Error fetching community pool balance:', err);
      return '--';
    }
  };

  useEffect(() => {
    if (address && !animationPlayed) {
      setAnimationData(animations[currentAnimationIndex]);
      setAnimationPlayed(true);
      setShowButtons(true);
      setLoading(true);
      // No need to set isAnimating

      // Fetch data from smart contract
      const fetchData = async () => {
        try {
          const addresses = await fetchAllAddresses();

          if (addresses.length === 0) {
            setError('No Assigned events found.');
            setLoading(false);
            return;
          }

          const balancePromises = addresses.map(async (addr: string) => {
            const balance = await fetchBalance(addr);
            return { address: addr, balance };
          });

          const results = await Promise.all(balancePromises);

          setBalances(results);
          console.log('Fetched Balances:', results);

          const poolBalance = await fetchCommunityPoolBalance();
          setCommunityPoolBalance(poolBalance);
          console.log('Community Pool Balance:', poolBalance);

          const top10Results = results
            .filter((item) => typeof item.balance === 'number')
            .sort((a, b) => (b.balance as number) - (a.balance as number))
            .slice(0, 10);

          setTop10(top10Results);
          console.log('Top 10 Balances:', top10Results);

          const userBalanceObj = results.find(
            (item) => item.address.toLowerCase() === address?.toLowerCase()
          );
          const fetchedUserBalance = userBalanceObj ? userBalanceObj.balance : null;
          setUserBalance(fetchedUserBalance);
          console.log('User Balance:', fetchedUserBalance);

          // Compute and set the top 10 users' information
          let top10UserInfosArray: { place: string; userInfo: string; balanceInfo: string }[] = [];

          for (let i = 0; i < top10Results.length; i++) {
            const place = `${i + 1}${getOrdinalSuffix(i + 1)} place`;
            const ensName = await getEnsName(top10Results[i].address as `0x${string}`);
            const baseName = await getBasename(top10Results[i].address as `0x${string}`);
            const truncatedAddress = truncateWalletAddress(top10Results[i]?.address);
            const userInfo = ensName || baseName || truncatedAddress;
            const balanceInfo =
              typeof top10Results[i]?.balance === 'number' ? top10Results[i].balance.toString() : 'N/A';

            // Populate the top10UserInfosArray
            top10UserInfosArray.push({ place, userInfo, balanceInfo });
          }

          setTop10UserInfos(top10UserInfosArray);
        } catch (err) {
          console.error('Error executing calculations:', err);
          setError('An error occurred while executing calculations.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [address, animationPlayed, currentAnimationIndex, animations, animationLoopSettings]);

  // Function to get ordinal suffix
  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  };

  // Handler for Next button - now plays the first animation again when at the end.
  // Also, if the user reaches the last animation, mark hasSeenLastAnimation true.
  const handleNext = () => {
    const nextIndex = currentAnimationIndex === animations.length - 1 ? 0 : currentAnimationIndex + 1;
    if (currentAnimationIndex === animations.length - 1) {
      setHasSeenLastAnimation(true);
    }
    setCurrentAnimationIndex(nextIndex);
    setAnimationData(animations[nextIndex]);
  };

  // Handler for Prev button (with processing guard)
  const handlePrev = () => {
    if (isPrevProcessing) return;
    setIsPrevProcessing(true);
    setCurrentAnimationIndex((prevIndex) => {
      const newIndex = prevIndex === 0 && hasSeenLastAnimation ? animations.length - 1 : prevIndex - 1;
      setAnimationData(animations[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsPrevProcessing(false), 100);
  };

  // Handler for Play/Pause button (only toggles state)
  const handlePlayPause = () => {
    console.log('Button clicked. Current paused state:', isAnimationPaused);
    setIsAnimationPaused(!isAnimationPaused);
  };

  // useEffect to control play/pause on the Lottie instance when isAnimationPaused changes
  useEffect(() => {
    if (lottieRef.current) {
      if (isAnimationPaused) {
        console.log('useEffect: Pausing animation');
        lottieRef.current.pause();
      } else {
        console.log('useEffect: Playing animation');
        lottieRef.current.play();
      }
    } else {
      console.log('useEffect: lottieRef.current is null');
    }
  }, [isAnimationPaused]);

  // Handler to open the primary drawer
  const handleVoteButtonClick = () => {
    setDrawerState('primary-open');
  };

  // Handler to close the primary drawer
  const handleClosePrimaryDrawer = () => {
    setDrawerState('closed');
  };

  // Handler to open the secondary drawer
  const handleOpenSecondaryDrawer = () => {
    setDrawerState('secondary-open');
  };

  // Handler to close the secondary drawer and reopen the primary drawer
  const handleCloseSecondaryDrawer = () => {
    setDrawerState('primary-open');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Single Lottie Container (Yellow Container) - shown on all viewports */}
      <div className="yellow-container relative block">
        {/* Main Animation */}
        {animationData && (
          <Lottie
            lottieRef={lottieRef} // Pass the ref to the Lottie component
            animationData={animationData}
            loop={animationLoopSettings[currentAnimationIndex]} // true or false
            onComplete={!isAnimationPaused ? handleNext : undefined}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 10,
            }}
          />
        )}
        {/* Full-screen overlay for left 20% */}
        <button
          onClick={handlePrev}
          className="absolute top-0 left-0 w-[20%] h-full cursor-pointer md:hover:bg-white/20 bg-transparent border-0"
          style={{ zIndex: 15 }}
        ></button>
        {/* Full-screen overlay for right 20% */}
        <button
          onClick={handleNext}
          className="absolute top-0 right-0 w-[20%] h-full cursor-pointer md:hover:bg-white/20 bg-transparent border-0"
          style={{ zIndex: 15 }}
        ></button>
        {/* Full-screen overlay for play/pause button in the center (60% width) */}
        <button
          onClick={handlePlayPause}
          className="absolute top-0 left-[20%] w-[60%] h-full cursor-pointer md:hover:bg-white/20 bg-transparent border-0"
          style={{ zIndex: 15 }}
        ></button>
        {/* Bottom Menu Animation rendered on top */}
        <Lottie
          animationData={BottomMenu}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 20,
            pointerEvents: 'none',
          }}
        />
        {/* Vote Button removed */}
      </div>

      {/* Desktop-only Red Container */}
      <div className="hidden md:block red-container">
        {/* Login Buttons */}
        <div className="flex justify-center" style={{ paddingTop: '10px' }}>
          <SignupButton />
          {!address && <LoginButton />}
        </div>
        {/* Prev and Next Buttons moved here */}
        {showButtons && address && (
          <div className="flex justify-center mt-4">
            {(currentAnimationIndex !== 0 || hasSeenLastAnimation) && (
              <button
                className="prev-button px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg"
                onClick={handlePrev}
                aria-label="Previous Animation"
              >
                Prev
              </button>
            )}
            <button
              className="next-button px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg ml-4"
              onClick={handleNext}
              aria-label="Next Animation"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {/* Green Container */}
        <div className="green-container relative">
          {/* Login Buttons */}
          <div
            className="absolute top-0 right-0 flex items-center"
            style={{ paddingTop: '5px', paddingRight: '5px' }}
          >
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>

        {/* Blue Container */}
        <div className="blue-container relative">
          {/* Prev and Next Buttons */}
          {showButtons && address && (
            <div
              className="absolute top-0 right-0 z-20"
              style={{ paddingTop: '5px', paddingRight: '5px' }}
            >
              {(currentAnimationIndex !== 0 || hasSeenLastAnimation) && (
                <button
                  className="prev-button px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  onClick={handlePrev}
                  aria-label="Previous Animation"
                >
                  Prev
                </button>
              )}
              <button
                className="next-button px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition ml-2"
                onClick={handleNext}
                aria-label="Next Animation"
              >
                Next
              </button>
            </div>
          )}
          {/* Vote Button removed */}
        </div>
      </div>

      {/* Primary Drawer */}
      <div
        className={`fixed inset-0 z-40 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
          drawerState === 'primary-open' ? 'translate-y-0' : 'translate-y-[100vh]'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
            drawerState === 'primary-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={drawerState === 'primary-open' ? handleClosePrimaryDrawer : undefined}
        ></div>

        {/* Drawer Content */}
        <div
          className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={handleClosePrimaryDrawer}
            aria-label="Close Primary Drawer"
          >
            &times;
          </button>

          {/* Drawer Container */}
          <div className="drawer-container w-full h-full relative">
            {/* Lottie Animation */}
            <Lottie
              key="dashboard" // Unique key for dashboard animation
              animationData={DashboardAnimation}
              loop={true} // This animation loops indefinitely
              className="w-full h-full"
            />

            {/* Removed: Pool balance, user balance, and top10UserInfos displays */}
          </div>
        </div>
      </div>

      {/* Secondary Drawer */}
      <div
        className={`fixed inset-0 z-50 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
          drawerState === 'secondary-open' ? 'translate-y-0' : 'translate-y-[100vh]'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
            drawerState === 'secondary-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={drawerState === 'secondary-open' ? handleCloseSecondaryDrawer : undefined}
        ></div>

        {/* Drawer Content */}
        <div
          className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={handleCloseSecondaryDrawer}
            aria-label="Close Secondary Drawer"
          >
            &times;
          </button>

          {/* Drawer Container */}
          <div className="drawer-container w-full h-full relative">
            {/* Leaderboard Lottie Animation */}
            <Lottie
              key="leaderboard" // Unique key for leaderboard animation
              animationData={LeaderboardAnimation}
              loop={true} // This animation loops indefinitely
              className="w-full h-full"
            />

            {/* Removed: User balance and top10UserInfos displays */}
          </div>
        </div>
      </div>
    </div>
  );
}
