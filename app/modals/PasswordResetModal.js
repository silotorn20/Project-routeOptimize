import React from "react";
import Link from 'next/link';
// css
import st from '../css/repass.module.css'

const PasswordResetModal = ({
  isOpen,
  email,
  setEmail,
  handlePasswordResetRequest,
  closeModal,
}) => {
  if (!isOpen) return null; // ถ้า modal ไม่เปิด ไม่แสดงอะไรเลย

  return (
    <div
      className={`${isOpen ? "fixed" : "hidden"
        } overflow-y-auto overflow-x-hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-50  h-full w-full flex items-center justify-center`}
    >

      <div className="bg-white rounded-lg shadow-xl p-6 w-[470px] h-[419px] max-w-2xl relative z-50 max-h-[90vh] overflow-y-auto">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className={st.title}>
            Reset password
          </h2>
          <div className={st.p}>
            Reset password with your email
          </div>
        </div>
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handlePasswordResetRequest} className="space-y-6">
            <div className={st.text_email}>
              <label htmlFor="email">
                Work email
              </label>
              <div className={st.input_placeholder_email}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={st.input_email}
                />
              </div>
            </div>
            <div>
              <button type="submit" // Explicitly set as a submit button
                className={st.btn}>Submit</button>
            </div>
          </form>
          <div className='mt-20'>
            <Link href="#" onClick={closeModal} className={st.link}>
              <div className='flex'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <div className='ml-2 mt-1'>
                  Back to log in
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;
