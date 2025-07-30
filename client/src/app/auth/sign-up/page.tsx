'use client'
import React, { FormEvent, useState, ReactElement } from 'react'
import { GalleryVerticalEnd } from "lucide-react"

import { SignUpForm } from "@/components/sign-up-form"
import { apiRoute } from '@/lib/api-express';
import AlertState from '@/types/alert.type';

export default function SignUpPage() {


    const [alert, setAlert] = useState<AlertState>({ hidden: true, text: "" })

    const resetAlert = () => setAlert({ hidden: true, text: "" });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {

        event.preventDefault();

        resetAlert();

        // Gets data from Data Form
        const formData = new FormData(event.currentTarget);

        const username = formData.get("username") as string;
        const name = formData.get("name") as string;
        const surnames = formData.get("surnames") as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const passwordAgain = formData.get('password-again') as string;



        if (password !== passwordAgain) {

            setAlert({ hidden: false, text: "Las contraseñas deben coincidir" })

        }
        else {

            try {

                const response = await fetch(apiRoute("/api/auth/register"), {

                    "method": "POST",
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name, username, surnames }),

                });

                if (!response.ok) {

                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }

            }

            catch (e) {

                if (e instanceof Error) {


                    const splitError = e.message.split("\n");
                    const text = splitError.map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i < splitError.length - 1 && <br />}
                        </React.Fragment>
                    ));

                    setAlert({ hidden: false, text });

                }
            }
        }

    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-3 md:p-5">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Tech4Net

                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <SignUpForm handleSubmit={handleSubmit} alert={alert} />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/placeholder.svg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>



        </div>
    )
}
