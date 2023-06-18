import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'gatsby';
import Footer from '../components/Footer';
import Logo from '../assets/Logo.svg';

const Layout = ({ children, additionalClass = [] }) => (
    <main
        className={[
            'flex', 'flex-col', 'justify-between', 'items-center', ...additionalClass,
        ].join(' ')}
    >
        <Helmet>
            <html className="bg-blue-500" lang="en" />
        </Helmet>
        {children}
      <Footer/>
    </main>
);

export default Layout;
