import Layout from "./application"
import { ApplicationTimeout } from "../src/forms/applications/ApplicationTimeout"

const FormLayout = (props) => {
  return (
    <>
      <ApplicationTimeout />
      <Layout>
        <section className="p-px bg-gray-300">
          <div className="md:mb-20 md:mt-12 mx-auto max-w-lg">
            {props.children}
          </div>
        </section>
      </Layout>
    </>
  )
}

export default FormLayout
