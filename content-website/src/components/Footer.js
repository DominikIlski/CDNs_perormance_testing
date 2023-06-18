import React from 'react';
import { PoweredByFlotiq } from 'flotiq-components-react';

const Footer = () => (
    <footer className="flex items-center justify-center">
        <div className="w-auto flex-col
                inline-flex justify-between md:justify-center items-center
                bg-light rounded-t-lg text-dark"
        >
            <p className="text-center text-xs md:text-base">
                Master thesis: Web services testing with the use of CMS and CDS systems.
                Author: Dominik Ilski
                Supervisor: Dr inż. Jakub Długosz
            </p>
          <p className="text-center text-xs md:text-base">{new Date().getFullYear()}</p>
        </div>
    </footer>
);

export default Footer;
