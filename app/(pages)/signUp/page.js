//SignUp Page
'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useState } from 'react';
import Form from 'next/form'
import Image from 'next/image';
import Logo from './../../Image/Logo.png'
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import app from "../../../config";
//css
import styles from './signup.module.css'

export default function SignUp() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [showFGPassword, setShowFGPassword] = useState(false);
    const [alertMessage, setalertMessage] = useState(null);
    const auth = getAuth(app);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            localStorage.setItem(
                "registrationData",
                JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                })
            );

            // setMessage("Registration successful! Please check your email for verification.");
            // alert("Registration successful! Please check your email for verification.");
            setalertMessage({
                type: "success",
                message: "You're now past of our team here."
            })

            setTimeout(() => {
                setalertMessage(null);
            }, 3000)
            setLoading(false);
            router.push("/");

            // Uncomment the following line if you want to redirect after signup.
            // router.push("/home");
        } catch (error) {
            setLoading(false);
            alert("มีบัญชีอยู่แล้ว");

        }
    };

    const signInWithGoogle = async () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            router.push("/map");
        } catch (error) {
        }
    };

    const [error, setError] = useState("");

    const validatePassword = (password) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number";
        }
        return ""; // Valid password
    };

    const handleChange = (e) => {
        handleInputChange(e);
        const errorMessage = validatePassword(e.target.value);
        setError(errorMessage);
    };

    return (
        // <div className={styles.root_signUp}>
        //     <main className={styles.card}>
        <div className="flex min-h-screen  flex-col items-center justify-center px-4 py-8 lg:px-6">
            {alertMessage && (
                <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                    <span className="font-medium">Signup was a success!!</span> {alertMessage.message}
                </div>
            )}
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <div className='flex justify-center'>
                    <Image
                        src={Logo}
                        width={161}
                        height={161}
                        alt="Picture of the author"
                    />
                </div>
                <h2 className={styles.title}>
                    Create account
                </h2>
                <div className={styles.p}>
                    <span>Sign up to route optimize</span>
                </div>
            </div>
            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
                <Form onSubmit={handleSubmit} className="space-y-6">
                    <div className={styles.text_email}>
                        <label htmlFor="email">
                            Work email
                        </label>
                        <div className={styles.input_placeholder_email}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your Email"
                                required
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={styles.input_email}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className={styles.text_password}>
                            Password
                        </label>
                        <div className={`${styles.input_placeholder_password} relative`}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                required
                                autoComplete="new-password"
                                onChange={handleChange}
                                className={styles.input_password}
                            />
                            <button type='button' onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 mt-2 text-gray-500 focus:outline-none">
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                                    </svg>

                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className={styles.text_password}>
                            Confirm Password
                        </label>
                        <div className={`${styles.input_placeholder_password} relative`}>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showFGPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                required
                                onChange={handleChange}
                                className={styles.input_password}
                            />
                            <button type='button' onClick={() => setShowFGPassword(!showFGPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 mt-2 text-gray-500 focus:outline-none">
                                {showFGPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                                    </svg>

                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
                    </div>

                    <div>
                        <button type="submit" className={styles.btn_login}>Sign Up</button>
                    </div>
                    <div className={styles.hr_line}>
                        <span className='mt-10'>Or</span>
                    </div>
                </Form>
                <div>
                    <button type="submit" onClick={signInWithGoogle} className={styles.btn_google}>
                        <div className={`${styles.logo_google} gap-2`}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <path d="M19.9895 10.1873C19.9895 9.36792 19.9214 8.76998 19.7742 8.1499H10.1992V11.8482H15.8195C15.7062 12.7673 15.0943 14.1514 13.7346 15.0815L13.7155 15.2053L16.7429 17.4972L16.9527 17.5176C18.8789 15.7791 19.9895 13.2213 19.9895 10.1873Z" fill="#4285F4" />
                                    <path d="M10.1993 19.9312C12.9527 19.9312 15.2643 19.0453 16.9527 17.5173L13.7346 15.0812C12.8734 15.6681 11.7176 16.0777 10.1993 16.0777C7.50242 16.0777 5.21352 14.3393 4.39759 11.9365L4.27799 11.9464L1.13003 14.3271L1.08887 14.439C2.76588 17.6944 6.2106 19.9312 10.1993 19.9312Z" fill="#34A853" />
                                    <path d="M4.39748 11.9368C4.18219 11.3167 4.05759 10.6523 4.05759 9.96583C4.05759 9.27927 4.18219 8.61492 4.38615 7.99484L4.38045 7.86278L1.19304 5.44385L1.08876 5.49232C0.397576 6.84324 0.000976562 8.36026 0.000976562 9.96583C0.000976562 11.5714 0.397576 13.0884 1.08876 14.4393L4.39748 11.9368Z" fill="#FBBC05" />
                                    <path d="M10.1993 3.85336C12.1142 3.85336 13.406 4.66168 14.1425 5.33718L17.0207 2.59107C15.253 0.985496 12.9527 0 10.1993 0C6.2106 0 2.76588 2.23672 1.08887 5.49214L4.38626 7.99466C5.21352 5.59183 7.50242 3.85336 10.1993 3.85336Z" fill="#EB4335" />
                                </g>
                            </svg>
                            Continue with Google
                        </div>
                    </button>
                </div>
                <div className={styles.text_account}>
                    Already have an account? <Link href="/" className={styles.textaccount}>
                        Login account
                    </Link>
                </div>
            </div>
        </div>
        //     </main>
        // </div>
    );
}