import React, { useState, useCallback } from 'react'
import styled, { css } from 'styled-components'
import { useWeb3Context } from 'web3-react'
import { useAppContext } from '../../context'
import { ethers } from 'ethers'
import { getCountries, getStates, getCountry } from 'country-state-picker'
import Gallery from '../../components/Gallery'
import BuyButtons from '../../components/Buttons'
import Button from '../../components/Button'
import Checkout from '../../components/Checkout'
import { amountFormatter, TOKEN_ADDRESSES, getContract } from '../../utils'
import BurnableERC20 from '../../BurnableERC20.json'

function Header({ ready, dollarPrice }) {
  const { account } = useWeb3Context()

  return (
    <HeaderFrame>
      <Status ready={ready} account={account} />
      <Title>Uni ring tokens (URING)</Title>
      <CurrentPrice>{dollarPrice && `$${amountFormatter(dollarPrice, 18, 2)} USD`}</CurrentPrice>
      <Tagline>dynamically priced rings</Tagline>
    </HeaderFrame>
  )
}

export default function Body({
  selectedTokenSymbol,
  setSelectedTokenSymbol,
  ready,
  unlock,
  validateBuy,
  buy,
  validateSell,
  sell,
  dollarize,
  dollarPrice,
  balanceSOCKS,
  reserveSOCKSToken
}) {
  const { library, account } = useWeb3Context()
  const [state, setState] = useAppContext()
  const [currentTransaction, _setCurrentTransaction] = useState({})
  const [country, setCountry] = useState(null)
  const setCurrentTransaction = useCallback((hash, type, amount) => {
    _setCurrentTransaction({ hash, type, amount })
  }, [])
  const clearCurrentTransaction = useCallback(() => {
    _setCurrentTransaction({})
  }, [])

  function handleToggleCheckout(tradeType) {
    setState(state => ({ ...state, redeemVisible: !state.redeemVisible, tradeType }))
  }

  async function redeem() {
    handleToggleCheckout()

    // Should open metamask to request signature for burning
  }

  async function burnToken() {
    const contract = getContract(TOKEN_ADDRESSES.SOCKS, BurnableERC20, library, account)
    console.log(contract)
    const tokenName = await contract.name()
    console.log('token name', tokenName)

    const overrides = {
      gasLimit: 750000
    }
    await contract.burn('100', overrides)
  }

  function renderContent() {
    console.log(getCountries())
    return (
      <div style={{ width: '100%' }}>
        <h3>Shipping Info</h3>
        <p>Name</p>
        <Input></Input>
        <p>Address</p>
        <Input></Input>
        <p>City</p>
        <Input></Input>
        <p>Country</p>
        <Select onChange={x => setCountry(x.target.value)}>
          <option value="" selected disabled hidden>
            Choose here
          </option>
          {getCountries().map(countries => {
            return <option value={countries.code}>{countries.name}</option>
          })}
        </Select>
        <p>State/Province</p>
        <Select>
          {country
            ? getStates(country).map(state => {
                return <option value={state}>{state}</option>
              })
            : null}
        </Select>
        <p>Postal Code</p>
        <Input></Input>
        <i>By burning 1 URING token, you confirm shipment to this address</i>
        <Button style={{ marginTop: '1em', width: '200px' }} onClick={() => burnToken()} text={'Confirm'} />
      </div>
    )
  }

  const Content = (
    <>
      <Header ready={ready} dollarPrice={dollarPrice} />
      <Gallery />
      <div>
        <Intro>
          purchasing a <b>URING</b> entitles you to 1{' '}
          <i>
            <b>real</b>
          </i>{' '}
          limited edition uni ring, shipped anywhere in the world.
        </Intro>
        <BuyButtons balance={balanceSOCKS} />
        <MarketData>
          {balanceSOCKS > 0 ? (
            <SockCount>
              You own {balanceSOCKS && `${amountFormatter(balanceSOCKS, 18, 0)}`} URINGS&nbsp; • &nbsp;
            </SockCount>
          ) : (
            ''
          )}
          <SockCount>{reserveSOCKSToken && `${amountFormatter(reserveSOCKSToken, 18, 0)} available`}</SockCount>
        </MarketData>
        <Redeem>
          {/* {balanceSOCKS > 0 ? `You have ${amountFormatter(balanceSOCKS, 18, 0)} SOCKS !! ` : 'Try clicking buyyyyy '} */}
          <RedeemLink>
            <Button style={{ width: '200px' }} onClick={() => redeem()} text={'Redeem'} />
          </RedeemLink>
          <p>
            <a target="_" href="https://ipfs.infura.io/ipfs/QmVPXerxekzpaxaAvZE2cHU51c9cYumJzLPoLd36385X6u">
              Warranty
            </a>{' '}
            for Tokenized Goods
          </p>
        </Redeem>
      </div>
      <Checkout
        selectedTokenSymbol={selectedTokenSymbol}
        setSelectedTokenSymbol={setSelectedTokenSymbol}
        ready={ready}
        unlock={unlock}
        validateBuy={validateBuy}
        buy={buy}
        validateSell={validateSell}
        sell={sell}
        dollarize={dollarize}
        currentTransactionHash={currentTransaction.hash}
        currentTransactionType={currentTransaction.type}
        currentTransactionAmount={currentTransaction.amount}
        setCurrentTransaction={setCurrentTransaction}
        clearCurrentTransaction={clearCurrentTransaction}
      />
      <div>
        `<CheckoutFrame redeemVisible={state.redeemVisible}>{renderContent()}</CheckoutFrame>
        <CheckoutBackground
          onClick={() => setState(state => ({ ...state, redeemVisible: !state.redeemVisible }))}
          redeemVisible={state.redeemVisible}
        />
      </div>
    </>
  )

  return <AppWrapper>{Content}</AppWrapper>
}

const AppWrapper = styled.div`
  width: 100vw;
  max-width: 640px;
  margin: 0px auto;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-top: 20vh;
  overflow: scroll;
  @media only screen and (min-device-width: 768px) {
    max-height: 480px;
    overflow: hidden;
    height: 100%;
  }
  @media only screen and (max-width: 640px) {
    /* padding-top: 0px; */
    overflow: hidden;
    padding-left: 2rem;
    max-height: 640px;
  }
  @media only screen and (max-width: 480px) {
    padding-top: 0px;
    padding-left: 0px;
    overflow: hidden;
    max-height: 800px;
  }
`

const Status = styled.div`
  width: 12px;
  height: 12px;
  position: fixed;
  top: 16px;
  right: 24px;
  border-radius: 100%;
  background-color: ${props =>
    props.account === null ? props.theme.orange : props.ready ? props.theme.green : props.theme.orange};
`

const HeaderFrame = styled.div`
  text-align: left;
  margin: 0px;
  font-size: 1.25rem;
  width: 100%;
  color: ${props => props.theme.primary};
  @media only screen and (max-width: 480px) {
    /* For mobile phones: */
    padding: 10vw;
    padding-top: 10vh;
  }
`

const Title = styled.p`
  font-weight: 500;
  margin: 0px;
  margin-bottom: 10px;
`

const Tagline = styled.p`
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0px;
  margin-top: 2rem;
`

const CurrentPrice = styled.p`
  font-weight: 700;
  margin: 0px;
  height: 1.125rem;
`

const Intro = styled.p`
  /* padding-left: 5vw; */
  margin: 0px;
  max-width: 300px;
  line-height: 180%;
  font-weight: 500;
  color: ${props => props.theme.primary};
  @media only screen and (max-width: 480px) {
    /* For mobile phones: */
    margin-top: 2rem;
    padding-left: 10vw;
  }
`

const SockCount = styled.p`
  font-weight: 500;
  font-size: 0.75rem;
  color: ${props => props.theme.uniswapPink};
  height: 0.5rem;
`

const Redeem = styled.p`
  font-weight: 500;
  /* padding-left: 10vw; */
  font-size: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.primary};
  @media only screen and (max-width: 480px) {
    /* For mobile phones: */
    /* margin-top: 2rem; */
    padding-left: 10vw;
  }
`

const RedeemLink = styled.span`
  /* font-size: 1rem; */
  text-decoration: italic;
  opacity: 1;
  /* color: ${props => props.theme.blue}; */
`

const MarketData = styled.div`
  display: flex;
  flex-direction: row;
  /* padding-left: 5vw; */
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  /* padding-bottom: 0.5rem; */
  @media only screen and (max-width: 480px) {
    /* For mobile phones: */
    padding-left: 10vw;
  }
`
const CheckoutFrame = styled.form`
  position: fixed;
  bottom: ${props => (props.redeemVisible ? '0px' : '-100%')};
  left: 0px;
  z-index: ${props => (props.redeemVisible ? '2' : '-1  ')};
  opacity: ${props => (props.redeemVisible ? '1' : '0')};
  top: 10px;
  transition: bottom 0.3s;
  width: 100%;
  margin: 0px;
  height: 815px;
  border-radius: 20px 20px 0px 0px;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  background-color: ${props => props.theme.grey};
  border-color: ${props => props.theme.black};
  color: ${props => props.theme.primary};

  @media only screen and (min-device-width: 768px) {
    max-width: 375px;
    margin: 5% auto; /* Will not center vertically and won't work in IE6/7. */
    left: 0;
    right: 0;
    border-radius: 20px 20px;
    z-index: ${props => (props.redeemVisible ? '2' : '-1  ')};
    opacity: ${props => (props.redeemVisible ? '1' : '0')};

    bottom: ${props => (props.redeemVisible ? '20%' : '-100%')};
  }

  p {
    margin-top: 0px;
  }
`

const CheckoutBackground = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  opacity: ${props => (props.redeemVisible ? '.2' : '0')};
  width: 100vw;
  height: 100vh;
  z-index: ${props => (props.redeemVisible ? '1' : '-1')};
  pointer-events: ${props => (props.redeemVisible ? 'all' : 'none')};
  background-color: ${props => props.theme.black};
  transition: opacity 0.3s;
  pointer-events: ${props => (props.redeemVisible ? 'all' : 'none')};
`
const CheckoutPrompt = styled.p`
  font-weight: 400;
  font-size: 14px;
  margin-bottom: 0;
`

const formStyle = css`
  font-size: 1rem;
  border-radius: 24px;
  margin-bottom: 1rem;
  font-family: sans-serif;
  font-weight: 700;
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  appearance: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: #fff;
  border: none;
  padding: 0px 1rem 0px 1rem;
  text-align: center;
  text-align-last: center;
`
const Select = styled.select`
  ${formStyle}
`

const Input = styled.input`
  ${formStyle}
`
