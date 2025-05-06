'use client';
import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from '@coinbase/onchainkit/identity';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { createClient } from '@supabase/supabase-js';

type WalletWrapperParams = {
  text?: string;
  className?: string;
  withWalletAggregator?: boolean;
};

const CLIENT_ID = '826453166710-kqi8unmv8gr8pmo05ltjc785kuu2pu1t.apps.googleusercontent.com';

// Initialize Supabase client using environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function handleGoogleLogin(credential: string) {
  try {
    // Verify the token and extract user information
    // const payload = await verifyToken(credential);

    // Insert the email into the logins table
    const { data, error } = await supabase
      .from('logins')
      .insert({ email: '' });

    if (error) {
      console.error('Error inserting login record:', error);
    } else {
      console.log('Login record inserted:', data);
    }
  } catch (error) {
    console.error('Error handling Google login:', error);
  }
}

function GoogleLoginButton() {
  const onSuccess = async (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);

    // Send the token to the server-side API route for verification
    const response = await fetch('/api/verifyToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Token verified:', data);
      // Alert the user's email
      alert(`User Email: ${data.payload.email}`);
    } else {
      console.error('Token verification failed:', data.error);
    }
  };

  const onError = () => {
    console.log('Login Failed');
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
      />
    </GoogleOAuthProvider>
  );
}

export default function WalletWrapper({
  className,
  text,
  withWalletAggregator = false,
}: WalletWrapperParams) {
  return (
    <>
      <Wallet>
        <ConnectWallet
          withWalletAggregator={withWalletAggregator}
          text={text}
          className={className}
        >
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick={true}>
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
            Go to Wallet Dashboard
          </WalletDropdownLink>
          <WalletDropdownFundLink />
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
      <GoogleLoginButton />
    </>
  );
}
