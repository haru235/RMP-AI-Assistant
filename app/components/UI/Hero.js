'use client';

import Link from "next/link";
import Image from 'next/image'

export default function Hero() {
    return (

        <section>
                <article className="flex gap-5 flex-col justify-center items-center h-96">
                    <h1 className="text-5xl">Fast, smart, and easy to use professor rating lookup</h1>
                    <p className="text-md text-gray-500">Get results faster with ProfAI and pull from every professor rating. All in one place.</p>
     
                        <Link className="px-20 py-2 gap-5 border-black border-2 rounded text-white flex items-center bg-black" href="/chatbotpage">Get Started<Image width={25} height={25} src="images/Play.svg" /></Link>

                </article>

            </section>)
}