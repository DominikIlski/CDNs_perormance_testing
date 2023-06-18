import React from 'react';
import Layout from '../layouts/layout';
import MyForm from "../components/Myform";
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';

const IndexPage = ({ data, pageContext }) => {
    return (
        <Layout>
          <h1>Web performance testing</h1>
          <h2>Simple website</h2>
          <MyForm/>
          <img src={img1} alt={"sleeping Koala"}/>
          <img className="pb-10" src={img2} alt={"big mountain"}/>
        </Layout>
    );
};

export default IndexPage;
