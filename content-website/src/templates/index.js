import React from 'react';
import Layout from '../layouts/layout';
import MyForm from "../components/Myform";
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img4 from '../assets/img4.jpg';
import img5 from '../assets/img5.jpg';
import LoremIpsumGenerator from "../components/Ipsum";


const IndexPage = ({ data, pageContext }) => {
    return (
        <Layout>
          <h1>Web performance testing</h1>
          <h2>Content heavy website</h2>
          <MyForm/>
          <img src={img1} alt={"img1"}/>
          <LoremIpsumGenerator paragraphs={10}/>
          <img src={img2} alt={"img2"}/>
          <LoremIpsumGenerator paragraphs={10}/>
          <img src={img3} alt={"img3"}/>
          <LoremIpsumGenerator paragraphs={10}/>
          <img src={img4} alt={"img4"}/>
          <LoremIpsumGenerator paragraphs={10}/>
          <img className="pb-10" src={img5} alt={"img5"}/>

        </Layout>
    );
};

export default IndexPage;
