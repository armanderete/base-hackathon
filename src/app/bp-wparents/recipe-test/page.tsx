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


import BottomMenu from './animations/bottom-menu.json'; // NEW: Import bottom-menu animation

import DashboardAnimation from './animations/dashboard.json';
import LeaderboardAnimation from './animations/leaderboard.json';

import BgStaticLottie from './animations/background.json';

// Interface for the recipe steps

interface Step {
  id: string;
  title: string;
  videoLottie: string;
  overlayLottie: string;
  primaryDrawerLottie?: string;
  secondaryDrawerLottie?: string;
}

const steps: Step[] = [
  {
    id: 'step0',
    title: 'step0',
    videoLottie: 'step0.json',
    overlayLottie: 'step0-overlay.json',
  },
  {
    id: 'step1',
    title: 'step1',
    videoLottie: 'step1.json',
    overlayLottie: 'step1-overlay.json',
    primaryDrawerLottie: 'step1-primarydrawer.json',
    secondaryDrawerLottie: 'step1-secondarydrawer.json',
  },
  {
    id: 'step2',
    title: 'step2',
    videoLottie: 'step2.json',
    overlayLottie: 'step2-overlay.json',
    primaryDrawerLottie: 'step2-primarydrawer.json',
    secondaryDrawerLottie: 'step2-secondarydrawer.json',
  },
  {
    id: 'step3',
    title: 'step3',
    videoLottie: 'step3.json',
    overlayLottie: 'step3-overlay.json',
    primaryDrawerLottie: 'step3-primarydrawer.json',
    secondaryDrawerLottie: 'step3-secondarydrawer.json',
  },
  {
    id: 'step4',
    title: 'step4',
    videoLottie: 'step4.json',
    overlayLottie: 'step4-overlay.json',
    primaryDrawerLottie: 'step4-primarydrawer.json',
    secondaryDrawerLottie: 'step4-secondarydrawer.json',
  },
  {
    id: 'step5',
    title: 'step5',
    videoLottie: 'step5.json',
    overlayLottie: 'step5-overlay.json',
    primaryDrawerLottie: 'step5-primarydrawer.json',
    secondaryDrawerLottie: 'step5-secondarydrawer.json',
  },
  {
    id: 'step6',
    title: 'step6',
    videoLottie: 'step6.json',
    overlayLottie: 'step6-overlay.json',
    primaryDrawerLottie: 'step6-primarydrawer.json',
    secondaryDrawerLottie: 'step6-secondarydrawer.json',
  },
  {
    id: 'step7',
    title: 'step7',
    videoLottie: 'step7.json',
    overlayLottie: 'step7-overlay.json',
    primaryDrawerLottie: 'step7-primarydrawer.json',
    secondaryDrawerLottie: 'step7-secondarydrawer.json',
  },
  {
    id: 'step8',
    title: 'step8',
    videoLottie: 'step8.json',
    overlayLottie: 'step8-overlay.json',
    primaryDrawerLottie: 'step8-primarydrawer.json',
    secondaryDrawerLottie: 'step8-secondarydrawer.json',
  },
  {
    id: 'step9',
    title: 'step9',
    videoLottie: 'step9.json',
    overlayLottie: 'step9-overlay.json',
    primaryDrawerLottie: 'step9-primarydrawer.json',
    secondaryDrawerLottie: 'step9-secondarydrawer.json',
  },
  // …add objects for all steps
];

// Define constants
const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;
const CONTRACT_ADDRESS = '0xfe3Fc6cb04bA5958b0577a0c6528269964e7C8bF'; // Your contract address

export default function Page() {
  const { address } = useAccount();

  // State to manage current step
  const [currentStep, setCurrentStep] = useState<number>(0); // Default to step0

  // State to manage drawer states
  const [drawerState, setDrawerState] = useState<'closed' | 'primary' | 'secondary'>('closed');

  // Placeholders for lazy-loaded data
  const [videoData, setVideoData] = useState<any>(null);
  const [ovlData, setOvlData] = useState<any>(null);
  const [drwData, setDrwData] = useState<any>(null);

  // Initialize ethers provider and contract
  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  useEffect(() => {
    let canceled = false;

    // 1 load video for the active step
    import(`./animations/${steps[currentStep].videoLottie}`)
      .then(m => !canceled && setVideoData(m.default));

    // 2 load overlay (if any) for the active step
    const ovlPath = steps[currentStep].overlayLottie;
    if (ovlPath) {
      import(`./animations/${ovlPath}`)
        .then(m => !canceled && setOvlData(m.default));
    } else {
      setOvlData(null); // no overlay on this step
    }

    // 3 prefetch prev/next to keep it snappy
    [currentStep - 1, currentStep + 1].forEach(i => {
      if (steps[i]) {
        import(`./animations/${steps[i].videoLottie}`);
        if (steps[i].overlayLottie) import(`./animations/${steps[i].overlayLottie}`);
      }
    });

    // cleanup when step changes or component unmounts
    return () => {
      canceled = true;
      setVideoData(null);
      setOvlData(null);
    };
  }, [currentStep]); // <-- depend on currentStep

  // Render background Lottie at z-index 0
  const renderBackground = () => (
    <Lottie
      animationData={BgStaticLottie}
      loop={true}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0, // Ensure background is behind other elements
      }}
    />
  );

  // Conditionally render overlay Lottie if available
  const renderOverlay = () => {
    if (steps[currentStep].overlayLottie) {
      return (
        <Lottie
          animationData={ovlData}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 20, // Ensure overlay is above step1
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Mobile Green Container (Login/User Wallet) - in normal flow to push yellow down */}
      <div className="green-container md:hidden">
        <div className="flex justify-end items-center" style={{ padding: '5px' }}>
          <SignupButton />
          {!address && <LoginButton />}
        </div>
      </div>

      {/* Single Lottie Container (Yellow Container) for Mobile */}
      <div className="yellow-container relative block md:hidden">
        {/* Lottie Animation for Mobile */}
        <Lottie
          animationData={videoData}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        />

        {/* Background Lottie Animation for Mobile */}
        {renderBackground()}

        {/* Overlay Lottie Animation for Mobile */}
        {renderOverlay()}

        {/* Button to Jump to Step 1 for Mobile */}
        <button
          onClick={() => setCurrentStep(1)}
          className="recipe-steps-button"
          style={{
            left: '3.5%',
            bottom: '32.5%',
          }}
          aria-label="Go to Step 1"
        />

        {/* Button to Jump to Step 2 for Mobile */}
        <button
          onClick={() => setCurrentStep(2)}
          className="recipe-steps-button"
          style={{
            left: '33.5%', // Default position, adjust as needed
            bottom: '32.5%', // Default position, adjust as needed
          }}
          aria-label="Go to Step 2"
        />
      </div>

      {/* Single Lottie Container (Yellow Container) for Desktop */}
      <div className="yellow-container relative hidden md:block">
        {/* Lottie Animation for Desktop */}
        <Lottie
          animationData={videoData}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        />

        {/* Background Lottie Animation for Desktop */}
        {renderBackground()}

        {/* Overlay Lottie Animation for Desktop */}
        {renderOverlay()}

        {/* Button to Jump to Step 1 desktop*/}
        <button
          onClick={() => setCurrentStep(1)}
          className="recipe-steps-button"
          style={{
            left: '3.5%',
            bottom: '32.5%',
          }}
          aria-label="Go to Step 1"
        />

        {/* Button to Jump to Step 2 desktop*/}
        <button
          onClick={() => setCurrentStep(2)}
          className="recipe-steps-button"
          style={{
            left: '33.5%', // Default position, adjust as needed
            bottom: '32.5%', // Default position, adjust as needed
          }}
          aria-label="Go to Step 2"
        />
      </div>

      {/* Primary Drawer */}
      {/* <div
        className={`fixed inset-0 z-40 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
          drawerState === 'primary-open' ? 'translate-y-0' : 'translate-y-[100vh]'
        }`}
      >
        {/* Overlay */}
        {/* <div
          className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
            drawerState === 'primary-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={drawerState === 'primary-open' ? handleClosePrimaryDrawer : undefined}
        ></div> */}
        {/* Drawer Content */}
        {/* <div
          className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {/* <button
            className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={handleClosePrimaryDrawer}
            aria-label="Close Primary Drawer"
          >
            &times;
          </button> */}
          {/* Drawer Container */}
          {/* <div className="drawer-container w-full h-full relative">
            {/* Lottie Animation */}
            {/* <Lottie
              key="dashboard"
              animationData={DashboardAnimation}
              loop={true}
              className="w-full h-full"
            /> */}
            {/* Extra displays removed */}
          {/* </div> */}
        {/* </div> */}
      {/* </div> */}

      {/* Secondary Drawer */}
      {/* <div
        className={`fixed inset-0 z-50 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
          drawerState === 'secondary-open' ? 'translate-y-0' : 'translate-y-[100vh]'
        }`}
      >
        {/* Overlay */}
        {/* <div
          className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
            drawerState === 'secondary-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={drawerState === 'secondary-open' ? handleCloseSecondaryDrawer : undefined}
        ></div> */}
        {/* Drawer Content */}
        {/* <div
          className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {/* <button
            className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={handleCloseSecondaryDrawer}
            aria-label="Close Secondary Drawer"
          >
            &times;
          </button> */}
          {/* Drawer Container */}
          {/* <div className="drawer-container w-full h-full relative">
            {/* Leaderboard Lottie Animation */}
            {/* <Lottie
              key="leaderboard"
              animationData={LeaderboardAnimation}
              loop={true}
              className="w-full h-full"
            /> */}
            {/* Extra displays removed */}
          {/* </div> */}
        {/* </div> */}
      {/* </div> */}
    </div>
  );
}
