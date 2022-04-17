import Head from "next/head";

const Seo = ({ title }: { title?: string }) => (
  <Head>
    <title>{"Lunen Work Schedule" + (title ? " | " + title : "")}</title>
  </Head>
);

export default Seo;
