import React from 'react';
import Layout from '../layouts/layout';
import MyForm from "../components/Myform";
import Koala from '../assets/koala.jpg';
import Gora from '../assets/gora.jpg';

const IndexPage = ({ data, pageContext }) => {
    return (
        <Layout>
          <h1>Web performance testing</h1>
          <h2>Simple website</h2>
          <MyForm/>
          <img src={Koala} alt={"sleeping Koala"}/>
          <img className="pb-10" src={Gora} alt={"big mountain"}/>

        </Layout>
    );
};

export default IndexPage;
