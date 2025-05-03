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
// import { getBasename, type Basename } from '../../../basenames';
// import { getEnsName } from '../../../ensnames';
// import { truncateWalletAddress } from '../../../utils';


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
  const [currentStep, setCurrentStep] = useState<number>(0);

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

    // 1) Load current step's video Lottie
    import(`./animations/${steps[currentStep].videoLottie}`)
      .then(m => {
        if (!canceled) setVideoData(m.default);
      });

    // 2) Load current step's overlay Lottie
    import(`./animations/${steps[currentStep].overlayLottie}`)
      .then(m => {
        if (!canceled) setOvlData(m.default);
      });

    // 3) Prefetch prev/next video & overlay for snappier transitions
    [currentStep - 1, currentStep + 1].forEach(i => {
      if (steps[i]) {
        import(`./animations/${steps[i].videoLottie}`);
        import(`./animations/${steps[i].overlayLottie}`);
      }
    });

    // Cleanup: tear down on step change or unmount
    return () => {
      canceled = true;
      setVideoData(null);
      setOvlData(null);
    };
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Mobile Green Container (Login/User Wallet) - in normal flow to push yellow down */}
      <div className="green-container md:hidden">
        <div className="flex justify-end items-center" style={{ padding: '5px' }}>
          <SignupButton />
          {!address && <LoginButton />}
        </div>
      </div>

      {/* Single Lottie Container (Yellow Container) - shown on all viewports */}
      <div className="yellow-container relative block">
        {/* Main Animation */}
        {/* animationData && (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={animationLoopSettings[currentAnimationIndex]}
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
        ) */}
        {/* Vote Button removed */}
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
