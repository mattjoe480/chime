import pino from 'pino';
import localFont from "next/font/local";
export const loginLoadingStates = [
    {
        text: "Preparing your secret lair...",
    },
    {
        text: "Dusting off the login credentials...",
    },
    {
        text: "Firing up the rocket boosters 🚀...",
    },
    {
        text: "Summoning the login gods... ⏳",
    },
    {
        text: "Almost there... Your password is being... decoded?",
    },
    {
        text: "Unlocking the mystery of the internet...",
    },
    {
        text: "Accessing the hidden realms of your account...",
    },
    {
        text: "Voila! You’re in! 🎉 The digital world is yours!",
    },
];

export const registerLoadingStates = [
    {
        text: "Building your digital identity...",
    },
    {
        text: "Finding your perfect username...",
    },
    {
        text: "Crafting the perfect password...",
    },
    {
        text: "Checking if your email is valid... 🧐",
    },
    {
        text: "Generating your secret agent profile...",
    },
    {
        text: "Engraving your digital signature... ✍️",
    },
    {
        text: "Assembling your personalized dashboard...",
    },
    {
        text: "And... you’re ready to rock! 🎸 Welcome aboard!",
    },
];


export const logger = pino({
    browser: {asObject: true},
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',  // Adjust log level for production or development
});

export const logirent = localFont({
    src: [
        {
            path: '../../public/fonts/logirent-regular.ttf',
            weight: '400'
        },
        {
            path: '../../public/fonts/logirent-bold.ttf',
            weight: '700'
        },
    ]
})