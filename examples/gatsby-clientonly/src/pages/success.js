import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const SuccessPage = () => (
  <Layout>
    <Seo title="Success" />
    <h1>Successful purchase!</h1>
    <p>
      Welcome to the sucess page - you made a successful purchase and were
      redirected here by Stripe.
    </p>
    <Link to="/">Go back to the store</Link>
  </Layout>
)

export default SuccessPage
