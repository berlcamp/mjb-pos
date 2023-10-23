import { CustomButton } from '@/components'
import type { SalesTypes } from '@/types'

interface ModalProps {
  hideModal: () => void
  sales: SalesTypes[]
}

const ProductsModal = ({ hideModal, sales }: ModalProps) => {
  console.log(sales)
  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2_medium">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              Products Purchased
            </h5>
            <button onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <div className="app__modal_body">
            <div className='my-2'>
              <table className="app__table">
                <thead className="app__thead">
                  <tr>
                    <th className="hidden md:table-cell app__th">
                        Product
                    </th>
                    <th className="hidden md:table-cell app__th">
                        Price
                    </th>
                    <th className="hidden md:table-cell app__th">
                        Quantity
                    </th>
                    <th className="hidden md:table-cell app__th">
                        Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    sales.map((item: SalesTypes, index: number) =>
                      <tr key={index} className="app__tr">
                        <th className="app__td">
                          <div className='text-sm'>{item.rdt_products?.description}</div>
                          {/* Mobile View */}
                          <div>
                            <div className="md:hidden app__td_mobile">
                              <div>Price: {item.unit_price}</div>
                              <div>Quantity: {item.quantity}</div>
                              <div>Total: {item.total}</div>
                            </div>
                          </div>
                          {/* End - Mobile View */}

                        </th>
                        <td className="hidden md:table-cell app__td">
                          <div>{item.unit_price}</div>
                        </td>
                        <td className="hidden md:table-cell app__td">
                          <div>{item.quantity}</div>
                        </td>
                        <td className="hidden md:table-cell app__td">
                          <div>{item.total}</div>
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
            <div className="app__modal_footer">
                <CustomButton
                  btnType='button'
                  title='Close'
                  handleClick={hideModal}
                  containerStyles="app__btn_green"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default ProductsModal
